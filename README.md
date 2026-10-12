# GPPW · Мұра

Школьное сообщество вещей — каталог, обмен/продажа/передача даром, QR-паспорт вещи, чаты между участниками и бронирование передачи в школе. Приложение «Мұра» работает на трёх языках (RU · KZ · EN) и в тёмной теме.

## Структура

```
.
├── apps/
│   └── site/            ← сайт: React (Vite) + API (Hono/oRPC) — деплой на Vercel
│       ├── api/         ← serverless-вход для Vercel (все запросы /api/*)
│       ├── src/api/     ← бэкенд: процедуры oRPC, маршруты, auth
│       └── src/web/     ← фронтенд: страницы, компоненты, запросы
└── packages/
    └── db/              ← база данных: схема Drizzle + миграции — Neon (Postgres)
        ├── src/schema/  ← auth.ts (пользователи), market.ts (товары),
        │                  chat.ts (чаты)
        └── drizzle/     ← сгенерированные миграции
```

Идея разнесения простая: **сайт** (фронт + бэк) живёт в `apps/site` и деплоится на Vercel, а **данные** (пользователи, товары, чаты) — в `packages/db`, подключается к базе Neon по Postgres через строку `DATABASE_URL`.

## Локальный запуск

```bash
cp .env.example .env        # заполните DATABASE_URL и BETTER_AUTH_SECRET
bun install
bun run db:push             # применить схему к базе (или db:migrate)
bun run dev                 # http://localhost:4200
```

Применение миграций:

```bash
bun run db:generate   # сгенерировать миграцию по изменениям schema/
bun run db:migrate    # накатить миграции из packages/db/drizzle
bun run db:push       # быстро синхронизировать схему (без файлов миграций)
```

## Проверки

```bash
bun run typecheck   # tsc по всем пакетам
bun run lint        # oxlint
bun run build       # продакшен-сборка
```

## Деплой

### База — Neon

1. Создайте проект в [Neon](https://neon.tech), скопируйте **pooled** connection string.
2. Прогоните миграции: `DATABASE_URL=... bun run db:push` (или `db:migrate`).

### Сайт — Vercel

1. Импортируйте репозиторий в Vercel.
2. **Root Directory** → `apps/site`.
3. Include source files outside of the Root Directory: **включено** (нужно для workspace `@gppw/db`).
4. Переменные окружения: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `WEBSITE_URL` (домен продакшена).

Всё самонастраивается через `apps/site/vercel.json`: сборка Vite → `dist/`, `api/[...path].ts` отдаёт `/api/*`, реврайт остальных путей на `index.html` (SPA-роутинг).

## Переменные окружения

| Переменная        | Назначение                                        |
| ----------------- | ------------------------------------------------- |
| `DATABASE_URL`    | Pooled connection string Neon (Postgres)          |
| `BETTER_AUTH_SECRET` | Секрет для Better Auth (`openssl rand -base64 32`) |
| `WEBSITE_URL`     | Публичный адрес сайта                             |
| `WEBSITE_PORT`    | Порт локального dev-сервера (по умолчанию 4200)   |

## API

Процедуры определены в `apps/site/src/api/routes/` (`market.ts`, `chats.ts`, `ping.ts`) и монтируются через oRPC в `src/api/index.ts`. Серверные функции доступны по адресу `/api/rpc/*`; авторизация — Better Auth на `/api/auth/*` (email + пароль, server-side сессии).