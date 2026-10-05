# AGENTS.md

Personal finance tracker (Russian-language UI): React SPA + Express API over Turso (libSQL) in
two separate npm packages. No root `package.json`, no workspaces, no CI, no tests, no TypeScript.
Deployed as a single Vercel project using **Services** — see `VERCEL.md` (deployment) and
`server/TURSO.md` (database).

## Commands

Always run from inside a package — there is no root script that starts both.

| Task | Command | Dir |
| --- | --- | --- |
| Install deps | `npm install` | `client/` or `server/` |
| Dev server | `npm run dev` | both |
| Production start | `npm start` (plain `node index.js`) | `server/` |
| Production start (Vercel-style) | `node vercel-entry.js` | `server/` |
| Apply DB schema to Turso | `npm run db:schema` | `server/` |
| One-shot Turso + Vercel deploy | `./scripts/deploy.sh` | `salary-tracker/` |
| Lint | `npm run lint` (`oxlint`) | `client/` only |
| Build | `npm run build` | `client/` only |

The server has **no lint and no typecheck script**. There is no test runner in either package —
the only automated check is `npm run lint` in `client/`. Verify API work with `curl`
(server prints its full endpoint list on boot, `server/index.js:16`).

For API work without a Turso account, `libsql` URLs accept `file:./local.db`, which exercises
the exact same code path as a remote database — useful for verifying changes offline.

`oxlint` currently exits 0 with ~13 pre-existing warnings (unused vars, `exhaustive-deps`,
`set-state-in-effect`). Don't treat those as regressions. `npx oxlint --fix` works but is not
wired into a script.

## Ports and wiring

- API `:3001` (`PORT`), Vite `:5173`. Defaults in `server/src/config/index.js:13`.
- **No Vite dev proxy.** The client calls an absolute URL from `VITE_API_URL` in `client/.env`
  (`http://localhost:3001/api/v1`, read at `client/src/services/api.js:2`).
- In a production build that URL comes from `client/.env.production` instead and is the
  relative `/api/v1` — Vite inlines env at build time, so Vite's `.env` load order decides
  which wins. The fallback in `api.js:72` hardcodes "порт 3001" and is wrong on Vercel.
- Changing the API port means editing **both** `client/.env` and `CORS_ORIGIN`
  (`server/src/config/index.js:24`). CORS is a single-origin allowlist with `credentials: true`,
  so it cannot be `*`.
- `server/.env` now **must** contain `TURSO_DATABASE_URL` (see `server/TURSO.md`); without it the
  server exits at boot. `dotenv` is pointed at an absolute path, so it is found regardless of cwd.
- The 401 handler in `api.js:57` clears storage and does a hard `window.location.href = '/login'`,
  bypassing React Router — expect a full page reload on token expiry.

## Deployment (Vercel)

One project, **two services** declared in `vercel.json` (repo root, one level above this file):
`frontend` = `client/` (Vite, `outputDirectory: dist`) and `backend` = `server/`
(`entrypoint: vercel-entry.js`). Top-level rewrites send `/api/(.*)` to the backend and
everything else to the frontend.

- **A request reaches a service with its original path** — `/api/v1/incomes` arrives as
  `/api/v1/incomes`, which is why `src/app.js` mounts `/api/v1` unchanged. Don't add a strip.
- Frontend and API share one domain, so **CORS never fires in production** and `CORS_ORIGIN`
  can stay at its localhost default.
- The frontend service has its own catch-all rewrite to `/index.html`; without it, hard-reloading
  `/dashboard` 404s (react-router `BrowserRouter`).
- Two entrypoints by design: `server/index.js` calls `app.listen()` for local dev,
  `server/vercel-entry.js` creates the server explicitly because Vercel supplies the port.
  Both share `src/app.js`. `vercel-entry.js` warms the Turso connection without awaiting it,
  so a cold start isn't blocked by the network.
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET` are project-level env vars shared by both
  services — set them once in the dashboard. `VITE_API_URL` needs no Vercel value.
- `scripts/deploy.sh` automates the whole publish (create Turso DB → token → `server/.env` →
  schema → Vercel project → env vars → `--prod` deploy). It needs `turso auth login` and
  `vercel login` first and hard-fails without them. Two CLI quirks it works around, don't
  "simplify" them away: `turso auth whoami` exits **0** when logged out (match on the
  "not logged in" text), and `vercel whoami` exits **1** with empty stdout.
- Use `vercel dev` to exercise the real routing table locally. Full runbook and a troubleshooting
  table are in `VERCEL.md`.

## Auth model

- JWT bearer (`Authorization: Bearer <token>`), 7-day expiry. Token in `localStorage.auth_token`,
  user in `localStorage.auth_user`.
- `JWT_SECRET` falls back to a hardcoded literal in `server/src/services/authService.js:7` when the
  env var is unset. Fine locally, must be set for any real deployment.
- Every router except `/auth` mounts `router.use(authenticate)`, which puts `req.userId` on the
  request (`server/src/middleware/auth.js:29`). Ownership is **not** handled by the middleware —
  each query must carry `WHERE user_id = ?` (see `services/expenseService.js` for the pattern).
- `ProtectedRoute` only checks that *a* token string exists, never that it's valid.

## API contract

Base path `/api/v1` (`server/src/app.js:19`).

- Success: `{ success: true, data, pagination? }`. Error: `{ error: { code, message } }`, produced
  by `errorHandler`, which must stay last in `app.js`.
- List endpoints (`GET /incomes`, `GET /expenses`) are paginated via `validatePagination`: default
  `page=1&limit=20`, and **limit > 100 is rejected with 422** (`server/src/middleware/validate.js:59`).
- Live trap: the date-range helpers in `client/src/services/incomeService.js:48` and
  `expenseService.js:50` still pass `limit: 1000`, so they get a 422. `summaryService.js` was
  already corrected to 100 (its comments say so). Any new list call must stay ≤ 100 and paginate.
- `date` is a `YYYY-MM-DD` string (regex-validated, not a timestamp); `amount` is a positive
  number, also enforced by `CHECK(amount > 0)` in the schema.
- Categories are an allowlist **duplicated in two files that must stay in sync**:
  `server/src/utils/categories.js` (server-side validation) and `client/src/utils/constants.js`
  (UI). They currently match exactly.

## Database

- Remote **Turso (libSQL)**, not a local file. Driver is `@libsql/client`; `sqlite`/`sqlite3` are
  gone. Config comes from `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` (`src/config/index.js:19`).
- **Don't call the libsql client directly.** Services only use `db.get` / `db.all` / `db.run` /
  `db.exec`, which are implemented by an adapter in `server/src/db/connection.js:32`. Its `run`
  returns `{ changes }` because services branch on `result.changes === 0`. Keep that shape if you
  extend the adapter.
- `getDb()` is a lazy singleton caching the *promise* and clearing itself on failure
  (`connection.js:81`), so a transient Turso outage doesn't poison later requests.
- **`schema.sql` is re-executed on every boot and is entirely `CREATE TABLE IF NOT EXISTS`, so
  there is no migration system.** Adding a column silently does nothing to an existing Turso
  database — reset it or run `ALTER TABLE` by hand via `turso db shell`.
- The old `server/data.db` is **stale and ignored** by the app — its data was not migrated. It's
  still tracked in git; `server/node_modules` (2336 files) is too. `server/.gitignore` exists now
  but doesn't retroactively untrack anything: `git rm -r --cached salary-tracker/server/node_modules`.

## Server conventions

- Layering is strict: `routes/` → `middleware/` → `controllers/` (thin: read req, call service,
  `res.json`) → `services/` (SQL, mapping, business rules) → `db/`. Follow it for new endpoints.
- DB rows are snake_case, everything above the DB layer is camelCase. Each service keeps a private
  `mapToCamelCase`.
- Services never touch `res`. They throw the factories from `middleware/errorHandler.js`
  (`createNotFoundError`, `createValidationError`, …), which the central handler converts.
- Validation is hand-rolled middleware, not a schema library; add to `middleware/validate.js`.
- Native ESM in both packages: `__dirname` doesn't exist. Reuse the `fileURLToPath` shim already
  present in `server/src/config/index.js` and `server/src/db/connection.js`.

## Client conventions

- Routes are declared centrally in `src/App.jsx`; `/login` and `/register` are public, everything
  else is nested under `ProtectedRoute` + `Layout`. Unknown paths redirect to `/dashboard`.
- CSS Modules per component (`X.module.css`). Global reset/tokens live in `src/styles/global.css`,
  imported once in `src/main.jsx`. `src/App.css` is dead — nothing imports it.
- One folder per page/component under `src/pages/` and `src/components/`, each holding a `.jsx`
  and its `.module.css`.
- All HTTP goes through `src/services/api.js` (`get`/`post`/`put`/`del`) plus a thin
  `*Service.js` wrapper. Components must not call `fetch` directly.
- `src/services/storage.js` (localStorage transaction cache, `generateId`) is legacy scaffolding
  from before the backend existed — it is not wired into the current auth/API flow. Auth storage
  lives in `services/authService.js` instead.
- Charts are recharts wrappers (`BarChart`, `PieChart`) fed by the `/summary/*` endpoints.
- Comments and all user-facing strings are in Russian — keep it that way, including new API error
  messages.