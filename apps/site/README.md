# @gppw/site

Фронтенд (React + Vite) и бэкенд (Hono + oRPC + Better Auth) приложения «Мұра».

- Фронтенд по умолчанию на `/` — SPA на wouter.
- API монтируется по `/api/rpc/*` (oRPC-процедуры из `src/api/routes/`).
- Better Auth — `/api/auth/*`.
- Render запускает Hono Node server через `src/api/server.ts`; он отдаёт API и собранный Vite SPA с одного origin.

## Запуск

```bash
bun run dev        # dev-сервер + API (в dev API отдаёт vite-plugin)
bun run build      # typecheck + сборка
bun run start      # production Node server; выполняется из apps/site
```
