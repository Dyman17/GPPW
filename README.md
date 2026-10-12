# GPPW · Мұра

Школьное сообщество вещей — каталог, обмен/продажа/передача даром, QR-паспорт вещи, чаты между участниками и бронирование передачи в школе. Приложение «Мұра» работает на трёх языках (RU · KZ · EN) и в тёмной теме.

## Структура

```
.
├── apps/
│   └── site/            ← React (Vite) + API (Hono/oRPC) — один Render Web Service
│       ├── src/api/     ← Hono/oRPC, Better Auth и production server
│       └── src/web/     ← фронтенд: страницы, компоненты, запросы
└── packages/
    └── db/              ← PostgreSQL: Drizzle-схема, миграции и pg pool
        ├── src/schema/  ← auth.ts (пользователи), market.ts (товары),
        │                  chat.ts (чаты)
        └── drizzle/     ← сгенерированные миграции
```

Frontend и backend работают в одном Render Web Service с общим origin. Это сохраняет same-origin cookies Better Auth и не требует отдельной CORS-настройки между сайтами. PostgreSQL работает как Render Postgres и подключается через `DATABASE_URL` по внутренней сети Render.

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

### Render

`render.yaml` описывает Render Web Service, который собирает Vite frontend и запускает Hono API вместе с ним, а также Render PostgreSQL. Blueprint передаёт приложению внутренний `DATABASE_URL` и генерирует `BETTER_AUTH_SECRET`. Миграции намеренно не запускаются автоматически: сначала проверьте целевую базу и примените `bun run db:migrate` к Render PostgreSQL. Если нужно перенести существующие данные, сначала сделайте проверенную резервную копию и отдельный план импорта.

## Переменные окружения

| Переменная        | Назначение                                        |
| ----------------- | ------------------------------------------------- |
| `DATABASE_URL`    | Внутренняя connection string Render PostgreSQL    |
| `BETTER_AUTH_SECRET` | Секрет для Better Auth (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Необязательный канонический origin Better Auth; при отсутствии используется `WEBSITE_URL` |
| `WEBSITE_URL`     | Публичный адрес сайта; Render Blueprint связывает его с `RENDER_EXTERNAL_URL` |
| `WEBSITE_PORT`    | Порт локального dev-сервера (по умолчанию 4200)   |

## API

Процедуры определены в `apps/site/src/api/routes/` (`market.ts`, `chats.ts`, `ping.ts`) и монтируются через oRPC в `src/api/index.ts`. Запросы каталога, профиля, объявлений, бронирований и чатов выполняются через Drizzle и `pg` в Render PostgreSQL. API доступно по `/api/rpc/*`; авторизация — Better Auth на `/api/auth/*` (email + пароль, server-side сессии).

Локально задайте `DATABASE_URL`, `BETTER_AUTH_SECRET` и при необходимости `WEBSITE_URL`/`BETTER_AUTH_URL` в `.env`. Render подставляет URL сервиса автоматически. Начальная миграция `0000_opposite_impossible_man.sql` содержит auth и прикладные таблицы; не запускайте её на существующей базе до сверки схемы.
