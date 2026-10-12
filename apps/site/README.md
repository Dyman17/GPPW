# @gppw/site

Фронтенд (React + Vite) и бэкенд (Hono + oRPC + Better Auth) приложения «Мұра».

- Фронтенд по умолчанию на `/` — SPA на wouter.
- API монтируется по `/api/rpc/*` (oRPC-процедуры из `src/api/routes/`).
- Better Auth — `/api/auth/*`.
- На Vercel всё собирает `vercel.json`, serverless-вход лежит в `api/[...path].ts`.

## Запуск

```bash
bun run dev        # dev-сервер + API (в dev API отдаёт vite-plugin)
bun run build      # typecheck + сборка
```