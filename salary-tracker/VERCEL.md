# Развёртывание на Vercel + Turso

Проект разворачивается **одним проектом Vercel** через механизм Services:
фронтенд и API живут на одном домене, поэтому CORS вообще не участвует в запросах.

- `/api/*` → backend-сервис (`server/`, Express)
- всё остальное → frontend-сервис (`client/`, Vite + React)

Конфигурация — `vercel.json` в корне репозитория.

```
/                → статика из client/dist (SPA)
   /dashboard, /history, /analytics  → /index.html (rewrite внутри frontend)
/api/v1/...      → Express, путь доходит без изменений
```

## Самый быстрый путь: одна команда

```bash
turso auth login    # один раз, открывает браузер
vercel login        # один раз, открывает браузер
./salary-tracker/scripts/deploy.sh
```

Скрипт сам создаёт базу Turso, выпускает токен, пишет `server/.env`, ставит
зависимости, заливает схему, создаёт проект Vercel, задаёт переменные окружения
и деплоит в production. Останавливается с понятной ошибкой, если вы не
авторизованы. Ниже — те же шаги вручную, если понадобится вмешательство.

## Шаг 0. Убрать node_modules из git

`server/node_modules` (2336 файлов) сейчас в git. Vercel скопирует репозиторий
целиком, и устаревший `node_modules` с уже удалённым `sqlite3` может сломать сборку.

```bash
git rm -r --cached salary-tracker/server/node_modules
```

Также устарел `salary-tracker/server/data.db` (база переехала на Turso):

```bash
git rm --cached salary-tracker/server/data.db
```

После этого сделайте коммит — деплой работает с содержимым git.

## Шаг 1. Создать базу Turso

По инструкции `server/TURSO.md`. Нужны два значения:

```bash
turso db create salary-tracker
turso db show salary-tracker --url      # TURSO_DATABASE_URL
turso db tokens create salary-tracker   # TURSO_AUTH_TOKEN
```

## Шаг 2. Залить схему

Схема применяется сама при первом обращении к базе, но лучше сделать это явно
из локальной копии — так сразу видно опечатки в подключении:

```bash
cd salary-tracker/server
npm install
TURSO_DATABASE_URL='libsql://...' TURSO_AUTH_TOKEN='...' npm run db:schema
```

Ожидаемый вывод: три таблицы `expenses, incomes, users` и нулевые счётчики.

## Шаг 3. Переменные окружения в Vercel

В Dashboard → Project → Settings → Environment Variables. Переменные общие для
обоих сервисов, достаточно задать один раз:

| Переменная | Значение | Обязательна |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | `libsql://salary-tracker-<орг>.turso.io` | да |
| `TURSO_AUTH_TOKEN` | токен из шага 1 | да |
| `JWT_SECRET` | своя случайная строка | для продакшена да |

`VITE_API_URL` задавать **не нужно**: в production-сборке он берётся из
`client/.env.production` и равен `/api/v1`, то есть указывает на тот же домен.

## Шаг 4. Деплой

Через Git: подключить репозиторий в Dashboard, Framework Preset — Other,
Root Directory — корень репозитория (где лежит `vercel.json`). Дальше Vercel
подхватит `vercel.json` сам.

Через CLI:

```bash
npm i -g vercel
vercel            # первый запуск: логин, привязка проекта
vercel --prod
```

## Шаг 5. Проверка

```bash
curl -X POST https://<ваш-домен>/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"secret123","name":"Test"}'
```

Если пришёл JSON с `token` — API, база и авторизация работают. Откройте домен в
браузере, зарегистрируйтесь и добавьте операцию: должен работать баланс и графики.

## Локальная проверка схемы деплоя

```bash
vercel dev
```

Поднимает оба сервиса локально с теми же правилами роутинга. Переменные окружения
подтягиваются из `.vercel/.env.local` (создайте его сами, он в `.gitignore`).

## Если что-то пошло не так

| Симптом | Причина и решение |
| --- | --- |
| 404 на `/dashboard` при перезагрузке страницы | Не сработал rewrite на `index.html`. Он задан в `services.frontend.rewrites` в `vercel.json`. |
| Клиент грузится, запросы падают с CORS-ошибкой | API и фронт разъехались по доменам. Либо верните один проект, либо задайте `CORS_ORIGIN` и `VITE_API_URL` явно. |
| `Module not found: '@libsql/client'` | Не установлены зависимости: удалённый `node_modules` (шаг 0) или сбой `installCommand`. |
| Ошибка сборки `bcrypt` / native module | Vercel не собрал нативный модуль. Замена на чистый JS-аналог `bcryptjs` убирает проблему (хеши совместимы). |
| Первый запрос очень медленный | Холодный старт: функция инициализируется и подключается к Turso. Нормально. |
| `Error: Не задан TURSO_DATABASE_URL` в логах | Не задана переменная окружения на Vercel (шаг 3). |
| Пустая база, хотя данные загружались локально | Данные из `data.db` намеренно не переносились. Загрузите их отдельно или заведите заново. |

## Что где лежит

| Файл | Роль |
| --- | --- |
| `vercel.json` (корень репозитория) | сервисы, роутинг, output-каталог |
| `salary-tracker/scripts/deploy.sh` | автоматическая публикация целиком |
| `salary-tracker/server/vercel-entry.js` | вход для Vercel; локально используется `server/index.js` |
| `salary-tracker/client/.env.production` | адрес API в production-сборке (`/api/v1`) |
| `salary-tracker/server/TURSO.md` | подключение к базе Turso |
| `.gitignore` (корень репозитория) | игнорирует `.vercel` |

Замечание: `server/index.js` продолжает поднимать сервер через `app.listen()` для
локальной разработки, `vercel-entry.js` создаёт сервер явно для Vercel. Общая
логика в `src/app.js`, поэтому эндпоинты нигде не дублируются.