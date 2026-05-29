# Переименование терминологии (март 2026)

Одна миграция: `20260529120000_rename_domain_terminology`

## Что изменилось

| Было | Стало |
|------|--------|
| `CUSTOMER` | `CLIENT` |
| `EXECUTOR` | `FREELANCER` |
| `Order` | `Project` |
| `OrderStatus` | `ProjectStatus` |
| `OrderResponse` | `Proposal` |
| `Offer` | `Solution` |
| `Complaint` | `Report` |
| `authorId` / `executorId` (на проекте) | `clientId` / `freelancerId` |
| `orderId` | `projectId` |
| `message` (в отклике) | `coverLetter` |
| — | `proposedBudget`, `estimatedDays` в `Proposal` |
| `authorId` (в Solution) | `freelancerId` |
| `authorId` (в Report) | `reporterId` |

**Forum** по-прежнему использует `authorId` (автор поста).

## URL на фронте

| Старый | Новый |
|--------|--------|
| `/orders` | `/projects` |
| `/post-order` | `/projects/new` |
| `/executors` | `/freelancers` |
| `/offers` | `/solutions` |

Редиректы в `client/src/proxy.ts`.

## Для Влада — после pull

```bash
git pull origin dev   # или ветка с этим PR
cd server
npx prisma migrate deploy
npx prisma generate
npm run build

cd ../client
npm run build
```

Перезапустить `npm run dev` в server и client.

## Совместимость

- `client/src/lib/roles.ts` — `normalizeRole()` понимает старые `CUSTOMER` / `EXECUTOR` в cookies.
- Данные в Supabase **сохраняются** (rename, не drop).

## Следующая миграция: ProfileView

`20260529130000_add_profile_view` — таблица `ProfileView`, поле `Profile.viewCount`.

После pull:

```bash
cd server && npx prisma migrate deploy && npx prisma generate
```

## Если migrate deploy упал

1. Проверить, что миграции `init` и `add_cascade_delete` уже применены.
2. Не применять миграцию дважды вручную.
3. Написать в чат — смотрим `_prisma_migrations`.
