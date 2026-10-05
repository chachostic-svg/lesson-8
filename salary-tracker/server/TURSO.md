# Подключение к Turso

Бэкенд работает на Turso (libSQL) — удалённой базе. Локального файла `data.db`
больше нет: при отсутствии настроек сервер падает при старте с понятной ошибкой.

## 1. Установить CLI Turso

```bash
curl -fsSL https://get.tur.so/install.sh | bash
turso version
```

## 2. Создать базу и получить доступ

```bash
turso db create salary-tracker

# URL базы — вставить в TURSO_DATABASE_URL
turso db show salary-tracker --url

# Токен — вставить в TURSO_AUTH_TOKEN, показывается один раз
turso db tokens create salary-tracker
```

## 3. Заполнить `server/.env`

```bash
cp server/.env.example server/.env
```

```dotenv
TURSO_DATABASE_URL=libsql://salary-tracker-<ваша-орг>.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOi...
JWT_SECRET=<случайная строка>
```

## 4. Установить зависимости

```bash
cd server
npm install
npm run db:schema
```

`db:schema` применяет `src/db/schema.sql` и печатает список созданных таблиц.
Это тот же скрипт, что выполняется при старте сервера, — отдельного прогона
не требуется, если сервер запускается с доступной базой.

## 5. Запустить

```bash
npm run dev     # nodemon, порт 3001
```

Проверка:

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123","name":"Test"}'
```

Токен из ответа подставить в заголовок для остальных запросов:

```bash
curl http://localhost:3001/api/v1/summary/balance -H "Authorization: Bearer <token>"
```

## Что изменилось в коде

| Было | Стало |
| --- | --- |
| `sqlite` + `sqlite3`, файл `server/data.db` | `@libsql/client`, удалённая база Turso |
| `DB_PATH` в `server/src/config/index.js` | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` |
| `db.get` / `db.all` / `db.run` из пакета `sqlite` | те же методы, но через адаптер в `src/db/connection.js` |

Сервисы в `src/services/` не менялись: адаптер в `src/db/connection.js` повторяет
интерфейс, который они использовали раньше (`get`, `all`, `run`, `exec`).

## Что стоит учесть

- **Схема применяется при каждом старте** и состоит только из `CREATE TABLE IF NOT
  EXISTS`. Миграций нет: новый столбец в существующей таблице не появится сам —
  нужно либо удалить базу, либо выполнить `ALTER TABLE` вручную через
  `turso db shell salary-tracker`.
- **Данные из старого `data.db` не перенесены.** Файл остался в репозитории и
  игнорируется приложением. Если он больше не нужен, его можно убрать из git:
  `git rm --cached salary-tracker/server/data.db`.
- **`server/node_modules` тоже в git** (2336 файлов), потому что `.gitignore`
  появился только сейчас. `git ls-files salary-tracker/server/node_modules | wc -l`
  покажет, что осталось; убрать: `git rm -r --cached salary-tracker/server/node_modules`.
- **libSQL и удалённый доступ.** Каждый запрос идёт по сети, поэтому офлайн-разработка
  невозможна — это осознанный компромисс в пользу одного источника правды.
- **`schema.sql` рассчитан на SQLite-диалект** и на Turso выполняется как есть.