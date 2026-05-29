# AI Marketplace — работа в команде (2 человека)

**Участники:** Влад (`vlad`) — auth и пользователь · Антон (`anton`) — маркетплейс, UI, интеграции  
**Интеграционная ветка:** `dev` · **Личные ветки:** `vlad`, `anton`

Подробные задачи по спринту: [TASKS.md](./TASKS.md)

---

## Архитектура (как устроен проект)

| Часть | Технология | Папка | Порт |
|-------|------------|-------|------|
| Фронт | Next.js 16 | `client/` | 3000 |
| Бэк | NestJS 10 | `server/` | 4000 |
| БД | PostgreSQL + Prisma | `server/prisma/` | — |
| Вход | Supabase Auth | клиент + проверка на Nest | — |

Фронт **не ходит в БД напрямую**. Он вызывает Nest API с JWT из Supabase.

---

## Правила команды — простыми словами

### 1. Prisma и `schema.prisma` — один «владелец» за спринт

**Что это:** `server/prisma/schema.prisma` — единая схема всей базы (User, Order, Forum…). Из неё генерируется клиент Prisma и миграции.

**Почему одному за спринт:**

- Если оба одновременно меняют схему, миграции **конфликтуют** (две разные `migration_*` папки, разный порядок полей).
- Второй разработчик может **сломать** код первого (переименовал поле — у соседа падает сборка).
- `prisma generate` нужно запускать после каждого изменения — иначе TypeScript на бэке снова показывает «нет `user` в Prisma».

**Как работать вдвоём без боли:**

| Ситуация | Кто меняет schema |
|----------|-------------------|
| Спринт: Влад делает только auth/user | **Влад** меняет User, PrivacySettings; Антон schema **не трогает** |
| Спринт: Антон добавляет заказы | **Антон** добавляет Order, OrderResponse; Влад schema **не трогает** |
| Нужно поле в User для заказов | **Согласование в чате** → меняет тот, кто владеет schema **в этом спринте**, или короткий PR в `dev` |

**Процесс изменения схемы:**

1. Написать в чат: «добавляю модель X / поле Y».
2. Изменить `schema.prisma`.
3. `cd server && npx prisma migrate dev --name описание`.
4. `npx prisma generate` (или `npm i` в server — есть `postinstall`).
5. PR в `dev`, второй человек подтягивает и у себя запускает `npx prisma generate`.

---

### 2. Комментарии в коде (чтобы всем было проще разобраться)

**Пишем не каждую строку**, а то, что помогает через месяц понять «зачем»:

| Где | Что писать |
|-----|------------|
| Верх файла `.ts` | сущность, зона (Антон/Влад), базовый URL API |
| Nest `@Get` / `@Post` | кто может вызвать, что меняется в БД |
| Нестандартное правило | почему (`mine` до `:id`, только OPEN в каталоге, soft delete) |
| `app/actions/*.ts` | куда ходит запрос, без описания UI |

**Не пишем:** «создаём переменную», «импортируем React».

**Язык:** русский или английский — как в соседнем файле модуля.

---

### 3. API: префикс `/api` и `Authorization: Bearer <token>`

**Что это:** Все маршруты Nest начинаются с `/api` (настроено в `server/src/main.ts`).

Примеры:

- `GET http://localhost:4000/api/users/me`
- `POST http://localhost:4000/api/onboarding/complete`

**Авторизация:** защищённые эндпоинты требуют заголовок:

```http
Authorization: Bearer <access_token из Supabase>
```

На бэке `AuthGuard` проверяет токен через Supabase и кладёт `user.id` в запрос. **Свой логин на бэке не придумываем** — только Supabase JWT.

**Почему так:** один способ входа для всего приложения; фронт и бэк доверяют одному источнику правды (Supabase).

---

### 4. Клиент → сервер только через `lib/api.ts` и `app/actions/*`

**Что это:**

- `client/src/lib/api.ts` — единая обёртка `fetch`: подставляет URL API, Bearer-токен, обработка ошибок.
- `client/src/app/actions/*.ts` — Server Actions, которые вызывают `api.get/post/patch/delete`.

**Почему не вызывать API «откуда угодно»:**

- Иначе кто-то забудет токен → 401.
- Разные URL (`localhost:4000` vs production) разъедутся.
- Сложнее ревьюить и искать баги.

**Правильно:**

```ts
// app/actions/orders.ts
import { api } from "@/lib/api";
export async function createOrder(data) {
  return api.post("/orders", data);
}
```

**Неправильно:** `fetch("http://localhost:4000/orders")` прямо в компоненте страницы.

Исключение: `auth/callback/route.ts` — там один раз вызывается API при OAuth (уже так сделано).

---

### 5. Не дублировать auth в заказах/форуме — только `userId` из Guard

**Что это:** В модулях Orders, Forum, Messages **не пишем** свою проверку пароля, свои сессии, свой разбор JWT вручную.

**Как правильно на Nest:**

```ts
@UseGuards(AuthGuard)
@Post()
create(@CurrentUser() user: { id: string }, @Body() dto: CreateOrderDto) {
  return this.ordersService.create(user.id, dto);
}
```

`user.id` = UUID из Supabase = `User.id` в Prisma.

**Почему:** логика входа живёт **только** у Влада (`AuthGuard`, users, onboarding). Если в заказах сделать «свой auth», появятся дыры (один модуль проверяет, другой нет) и рассинхрон с БД.

**Зона Влада (не трогать без согласования):**

- `server/src/auth/`
- `server/src/users/`
- `server/src/onboarding/`
- `server/src/settings/` (аккаунт, privacy, delete)
- `client/src/app/register/`, `auth/callback/`, `onboarding/`

**Зона Антона (не трогать без согласования):**

- `server/src/orders/`, `offers/`, `forum/`, `messages/` (когда появятся)
- `client/src/app/orders/`, `forum/`, `messages/`, `dashboard/`, лендинг

Общие файлы (`lib/api.ts`, `AppShell`, `schema.prisma`) — только по правилам выше.

---

## Параллельная работа вдвоём

Да, **можно и нужно** работать параллельно, если соблюдать границы.

### Матрица: кто что делает одновременно

| Период | Влад (ветка `vlad`) | Антон (ветка `anton`) | Конфликты? |
|--------|---------------------|------------------------|------------|
| Спринт 1 | Роль из welcome → onboarding, `region`, OAuth | Лендинг/глобус, `post-order` UI, **Orders API** (schema Order — владеет Антон) | Нет, если Антон не меняет `users/` |
| Спринт 2 | Аватар Storage, доработка settings | Список заказов, карточка заказа, dashboard с API | Нет |
| Спринт 3 | Dual DB подготовка (region) | Executors каталог + публичный профиль | Согласовать поля Profile |

### Git-поток (профессионально, для двоих)

```
main          — прод (редко)
  └── dev     — общая интеграция (мержим сюда PR)
        ├── vlad   — Влад
        └── anton  — Антон
```

1. Перед работой: `git pull origin dev` в своей ветке (или rebase на `dev`).
2. Коммиты маленькие, по фиче.
3. PR: `anton` → `dev` или `vlad` → `dev`.
4. Второй ревьюит, мержит, у себя `git pull origin dev`.
5. После мержа с изменением Prisma: у обоих `cd server && npx prisma generate`.

### Локальный запуск (оба)

Терминал 1: `cd server && npm run dev` → :4000  
Терминал 2: `cd client && npm run dev` → :3000  

Один `.env` у server, один `.env.local` у client — **не коммитить**.

---

## Контракт между Владом и Антоном (стабильный API)

После входа пользователя **всегда** существует:

- Supabase session (JWT).
- Запись `User` в БД с `id` = Supabase user id.

Антон в своих модулях **опирается на это** и не создаёт пользователя заново.

| Endpoint | Статус | Кто владелец |
|----------|--------|--------------|
| `POST /onboarding/init` | ✅ | Влад |
| `POST /onboarding/complete` | ✅ (доработать роль) | Влад |
| `GET /users/me` | ✅ | Влад |
| `GET/PATCH /profile` | ✅ | Влад / общий |
| `GET/PATCH /settings/*` | ✅ | Влад |
| `CRUD /orders` | ❌ сделать | Антон |
| `CRUD /forum`, `/messages` | ❌ позже | Антон |

---

## Связь

- Перед изменением `schema.prisma` — сообщение в чат.
- Перед изменением чужой зоны — сообщение или PR с ревью.
- Баги на стыке (роль, region) — владелец зоны или вместе 15 мин sync.
