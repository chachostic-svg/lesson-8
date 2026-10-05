#!/usr/bin/env bash
# Полная автоматическая публикация: Turso + Vercel.
#
# Требуется один раз авторизоваться вручную (браузер):
#   turso auth login
#   vercel login
# После этого весь остальной процесс выполняет этот скрипт:
#   ./salary-tracker/scripts/deploy.sh
#
# Что делает:
#   1. создаёт базу Turso и выпускает токен
#   2. пишет server/.env
#   3. ставит зависимости и заливает схему в Turso
#   4. создаёт проект Vercel, задаёт переменные окружения
#   5. деплоит в production и печатает адрес для проверки

set -euo pipefail

DB_NAME="${TURSO_DB_NAME:-salary-tracker}"
PROJECT_NAME="${VERCEL_PROJECT_NAME:-salary-tracker}"
JWT_SECRET="${JWT_SECRET:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$(cd "$SCRIPT_DIR/../server" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

export PATH="$HOME/.turso:$PATH"

# Если токены лежат в файле, подхватываем их, чтобы не передавать их в чате.
# Ожидаемые имена: TURSO_API_KEY, VERCEL_TOKEN, GITHUB_TOKEN
SECRETS_FILE="${SECRETS_FILE:-$HOME/.deploy-secrets.env}"
if [ -f "$SECRETS_FILE" ]; then
  info "Загружаю секреты из $SECRETS_FILE"
  set -a
  # shellcheck disable=SC1090
  . "$SECRETS_FILE"
  set +a
fi

GIT_REMOTE_URL="${GIT_REMOTE_URL:-$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null || true)}"

info() { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }
fail() { printf '\033[1;31mОшибка: %s\033[0m\n' "$1" >&2; exit 1; }

# 1. Проверки окружения
info "Проверяю инструменты"
command -v turso >/dev/null || fail "turso CLI не найден. Установите: sh -c \"\$(curl -fsSL https://get.tur.so/install.sh)\""
command -v vercel >/dev/null || fail "vercel CLI не найден. Установите: npm i -g vercel"

# turso auth whoami при выходе из аккаунта печатает подсказку и возвращает код 0,
# поэтому ориентируемся на текст, а не на код возврата
if turso auth whoami 2>&1 | grep -q "not logged in"; then
  fail "Вы не авторизованы в Turso. Выполните: turso auth login"
fi
# vercel whoami при выходе из аккаунта не печатает ничего и возвращает код 1
if ! vercel whoami >/dev/null 2>&1; then
  fail "Вы не авторизованы в Vercel. Выполните: vercel login"
fi

echo "turso: $(turso --version 2>&1 | tail -1)"
echo "vercel: $(vercel --version 2>&1 | tail -1)"
echo "turso account: $(turso auth whoami 2>&1 | tail -1)"
echo "vercel account: $(vercel whoami 2>&1 | tail -1)"

# 2. База Turso
# Turso при ошибке печатает сообщение в stdout и возвращает код 0, поэтому URL
# извлекаем регуляркой: пустой результат означает "базы нет", а не "ошибка".
extract_db_url() {
  turso db show "$1" --url 2>/dev/null | grep -oE 'libsql://[A-Za-z0-9._-]+' | head -1
}

info "База Turso: $DB_NAME"
DB_URL="$(extract_db_url "$DB_NAME")"
if [ -n "$DB_URL" ]; then
  echo "База уже существует, используем её"
else
  echo "Создаю базу"
  turso db create "$DB_NAME" --wait
  DB_URL="$(extract_db_url "$DB_NAME")"
fi

[ -n "$DB_URL" ] || fail "не удалось получить URL базы (был вывод: $(turso db show "$DB_NAME" --url 2>&1 | head -2))"
echo "URL: $DB_URL"

info "Выпускаю токен доступа"
# Turso печатает токен вместе со служебными строками, поэтому берём самый длинный
# токеноподобный фрагмент, а не последнюю строку вывода
AUTH_TOKEN="$(turso db tokens create "$DB_NAME" 2>/dev/null | grep -oE '[A-Za-z0-9_.-]{40,}' | head -1)"
[ -n "$AUTH_TOKEN" ] || fail "не удалось получить токен доступа"
echo "Токен получен (${#AUTH_TOKEN} символов)"

# 3. server/.env
info "Записываю server/.env"
if [ -z "$JWT_SECRET" ]; then
  JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")"
fi
cat > "$SERVER_DIR/.env" <<EOF
TURSO_DATABASE_URL=$DB_URL
TURSO_AUTH_TOKEN=$AUTH_TOKEN
JWT_SECRET=$JWT_SECRET
EOF
chmod 600 "$SERVER_DIR/.env"
echo "server/.env создан (права 600)"

# 4. Схема
info "Зависимости и схема"
(cd "$SERVER_DIR" && npm install --no-audit --no-fund >/dev/null && npm run db:schema)

# 5. Проект Vercel
# link и deploy работают с текущей директорией, поэтому обязательно переходим
# в корень репозитория — там лежит vercel.json
cd "$REPO_ROOT"

info "Проект Vercel: $PROJECT_NAME"
if ! vercel project inspect "$PROJECT_NAME" >/dev/null 2>&1; then
  vercel project create "$PROJECT_NAME" --yes >/dev/null
  echo "Проект создан"
else
  echo "Проект уже существует"
fi
vercel link --project "$PROJECT_NAME" --yes --non-interactive >/dev/null

info "Переменные окружения Vercel"
for pair in "TURSO_DATABASE_URL=$DB_URL" "TURSO_AUTH_TOKEN=$AUTH_TOKEN" "JWT_SECRET=$JWT_SECRET"; do
  name="${pair%%=*}"
  vercel env add "$name" production --value "${pair#*=}" --sensitive --force --yes >/dev/null
  echo "  $name задан"
done

# 6. Деплой
info "Деплой в production"
vercel deploy --prod --yes

# 7. Привязка к GitHub, чтобы следующие пуши деплоились сами
if [ -n "$GIT_REMOTE_URL" ]; then
  info "Привязываю проект к репозиторию $GIT_REMOTE_URL"
  vercel git connect "$GIT_REMOTE_URL" --yes || {
    echo "⚠️  Не удалось привязать GitHub автоматически."
    echo "   Сделайте это вручную: Project Settings -> Git -> Connect Git Repository"
  }
fi

echo
echo "Готово. Проверка:"
echo "  curl -X POST https://$PROJECT_NAME.vercel.app/api/v1/auth/register \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"email\":\"test@example.com\",\"password\":\"secret123\",\"name\":\"Test\"}'"
echo
echo "Схему Turso можно посмотреть так:"
echo "  cd $SERVER_DIR && npm run db:schema"