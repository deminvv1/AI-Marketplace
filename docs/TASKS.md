# Задачи — простое деление (Влад + Антон)

**Идея:** каждый берёт **свои сущности в БД** и доводит **сам**: Nest API → Server Actions → страницы.

**Ветки:** `vlad` · `anton` · сливаем в **`dev`**

**Имена в коде (не путать):** Order → **Project**, OrderResponse → **Proposal**, Offer → **Solution**, Executor → **Freelancer**.  
URL: `/projects`, `/projects/new`, `/freelancers`, `/solutions` (старые `/orders`, `/executors` редиректятся в `proxy.ts`).

---

## Два «мира» в проекте

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│  ВЛАД — «Аккаунт»           │     │  АНТОН — «Маркетплейс»       │
│  Вход, настройки, чат       │     │  Проекты, профили, форум      │
└─────────────────────────────┘     └─────────────────────────────┘
```

---

## Таблица: кто какую сущность ведёт

| Сущность в БД | По-русски | Кто | Статус |
|---------------|-----------|-----|--------|
| **User** | Пользователь, роль, email | **Влад** | почти готово |
| **PrivacySettings** | Приватность | **Влад** | готово |
| **Notification** | Уведомления in-app + email (Resend) | **Антон** (v1) | list, unread, Project alert |
| **ProjectAlert** | Подписка на новые проекты | **Антон** | CRUD + matcher при create project |
| **Project** | Проект на бирже | **Антон** | CRUD: create, read, **update** (OPEN), complete, delete, фильтры |
| **Proposal** | Отклик | **Антон** | отклик, accept/reject, hire |
| **Solution** | Готовое AI-решение | **Антон** | CRUD API + каталог, new, detail |
| **ForumPost** / **ForumComment** | Форум | **Антон** | API + /forum, new, thread |
| **Profile** / **PortfolioItem** | Профиль, портфолио | **Антон** | PATCH profile + CRUD `/profile/portfolio`, вкладка Portfolio |
| **ProfileView** | Просмотры визитки | **Антон** | при GET `/freelancers/:username` |
| **Review** / **Favorite** | Отзыв, избранное | **Антон** | API + UI (отзыв после COMPLETED, Save на визитке) |
| **Conversation** / **Message** | Чат | **Антон** (v1) | API + `/messages`; доработка с **Владом** (real-time) |
| **Report** / **BlockedUser** | Жалоба, блок | **Антон** | API + UI (профиль, проект, solution, форум, чат; blocked в Settings) |
| **Taxonomy** Category/Skill | Справочник industry/tags | **Антон** | `GET /api/taxonomy`, seed, pickers, `?tag=` в каталогах |
| **Proposal notify** | In-app + email accept/reject | **Антон** | `PROPOSAL_ACCEPTED` / `PROPOSAL_REJECTED` + Resend |

---

## ВЛАД — «Аккаунт»

### Следующие задачи

1. Починить **роль** на onboarding  
2. **Region** RU/GLOBAL по стране  
3. **Messages** — после merge: согласовать owner с Антоном (база уже в `dev`, без mock)  

### После merge ветки Антона в `dev`

```bash
git pull origin dev
cd server && npx prisma migrate deploy && npx prisma generate
```

Миграции: `docs/MERGE_ANTON_TO_DEV.md` (включая `20260529180000_taxonomy`).  
Подробнее: `docs/MIGRATION_RENAME.md`.

---

## АНТОН — «Маркетплейс»

### Порядок (не прыгать между сущностями)

```
Project + Proposal  →  Profile + Portfolio  →  Solution  →  Forum  →  Review / Favorite
      [готово]                                              [готово]
```

---

### ✅ Сущность 1: **Project** + **Proposal** (сделано)

| Слой | Где |
|------|-----|
| Бэк | `server/src/projects/` |
| Actions | `client/src/app/actions/projects.ts`, `proposals.ts` |
| Фронт | `/projects`, `/projects/new`, `/projects/[id]`, dashboard |
| API | accept/reject, `PATCH .../:id` (OPEN), `PATCH .../complete` → COMPLETED |
| Каталог | `GET /projects?industry=&country=&q=` (только **OPEN**) |

**Владу для проверки:** роль CLIENT/BOTH — создать проект; FREELANCER/BOTH — отклик; CLIENT — Accept → IN_PROGRESS → Complete.

---

### ✅ Визитки фрилансеров (сделано)

| Слой | Где |
|------|-----|
| Бэк | `server/src/freelancers/` |
| Фронт | `/freelancers`, `/freelancers/[username]` |
| ProfileView | `recordProfileView` в `profile.service.ts` |

«Публичный» = виден **залогиненным** пользователям, не гостям с улицы (`proxy.ts`).

---

### ✅ Сущность 2: **Profile** + **PortfolioItem** (сделано)

| Слой | Где |
|------|-----|
| Бэк | `GET/PATCH /profile`, `POST/PATCH/DELETE /profile/portfolio/:id` |
| Фронт | `/profile` → вкладка Portfolio (CRUD), ссылка Public page |
| Визитка | `/freelancers/[username]` читает portfolioItems |

---

### ✅ Сущность 3: **Solution** (сделано)

| Слой | Где |
|------|-----|
| Бэк | `server/src/solutions/` — CRUD + фильтры |
| Фронт | `/solutions`, `/solutions/new`, `/solutions/[id]` |

---

### ✅ Сущность 4: **Forum** (сделано)

| Слой | Где |
|------|-----|
| Бэк | `server/src/forum/` — темы + комментарии (ответы) |
| Фронт | `/forum`, `/forum/new`, `/forum/[id]` |

---

### ✅ Сущность 5: **Review** + **Favorite** (сделано)

| Слой | Где |
|------|-----|
| Бэк | `server/src/reviews/`, `server/src/favorites/` |
| Actions | `client/src/app/actions/reviews.ts`, `favorites.ts` |
| Фронт | отзыв на `/projects/[id]` (COMPLETED), Reviews на визитке и `/profile`, Save + dashboard |

**Правила:** отзыв по проекту — только CLIENT, один раз; избранное: `freelancer` \| `project` \| `solution`.

### ✅ Редактирование проекта (сделано)

| Слой | Где |
|------|-----|
| API | `PATCH /api/projects/:id` — владелец, только **OPEN** |
| Фронт | `/projects/[id]/edit`, кнопка Edit на карточке |

### ✅ Лайки на форуме (сделано)

| Слой | Где |
|------|-----|
| БД | `ForumPostLike` (миграция `20260529150000_forum_post_likes`) |
| API | `POST /forum/posts/:id/like`, `GET .../liked` |
| Фронт | кнопка на `/forum/[id]` |

### ✅ Лайки на комментариях (сделано)

| API | `POST .../comments/:commentId/like`, `GET .../comments/likes/me` |

### ✅ Project alerts + Notifications (сделано)

| Слой | Где |
|------|-----|
| БД | `ProjectAlert`, индекс на `Notification` |
| API | `/api/project-alerts`, `/api/notifications` |
| Email | `EmailService` + `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL` |
| Фронт | `/project-alerts`, колокольчик в шапке, «Save as alert» на `/projects` |

### ✅ Глобальный поиск `/search` (v1 + фильтры)

Спека: `docs/SEARCH.md` · **`GET /api/search?q=&tag=&industry=`** · UI: keyword + taxonomy chips

### ✅ Taxonomy + каталоги из API (сделано)

| Слой | Где |
|------|-----|
| БД | `Category`, `Skill` — миграция `20260529180000_taxonomy` |
| API | `server/src/taxonomy/` |
| UI | `CategoryPicker`, `SkillTagPicker`, `catalog-taxonomy-filters` |
| Валидация | create/update project, forum, solution, alerts, profile industries |

### ✅ Proposal fields + уведомления (сделано)

| Поле / событие | Где |
|----------------|-----|
| `coverLetter`, `proposedBudget`, `estimatedDays` | форма отклика, `/proposals` |
| Accept / reject / auto-reject | in-app + **email** (`EmailService.sendProposalUpdate`) |

### ✅ Forum polish (сделано)

| Фича | API / UI |
|------|----------|
| Edit комментария | `PATCH .../comments/:id` |
| Delete комментария (+ replies) | `DELETE .../comments/:id` |
| Completed projects на `/profile` | `GET /api/projects/completed/mine` |

### ✅ Messages + Safety (сделано, v1)

| Слой | Где |
|------|-----|
| Чат | `server/src/messages/`, `/messages`, `?with=userId` |
| Reports | `server/src/reports/` — target: user, project, solution, forum_post |
| Blocks | `server/src/blocks/`, Settings → Privacy |
| UI | `UserSafetyActions` на карточках и в чате |

**Дальше (не в этом PR):** WebSocket/SSE для чата, админка модерации reports.

### ✅ Порядок «без поломок» (сделано)

| Шаг | Что |
|-----|-----|
| 1 | Редактирование темы форума — `/forum/[id]/edit` |
| 2 | Страница **`/saved`** — все типы избранного |
| 3 | **`docs/MERGE_ANTON_TO_DEV.md`** — чеклист для merge в `dev` |
| 4 | ~~Публичный каталог без логина~~ — **не делаем**: весь маркетплейс только после регистрации (`proxy.ts` + JWT на API) |

### ✅ Мои отклики + polish (сделано)

| Слой | Где |
|------|-----|
| API | `GET /api/proposals/mine` |
| Фронт | `/proposals`, пункт в сайдбаре |
| Дашборд | кликабельные проекты, счётчики откликов и уведомлений |
| Solutions | Save (favorite) на карточке |
| Alerts | поле tags в форме подписки |

---

## Как работать параллельно

| Влад | Антон |
|------|-------|
| `auth/`, `users/`, `onboarding/`, `settings/` | `projects/`, `freelancers/`, `solutions/`, `forum/`, `messages/` (v1) |
| schema: User… | schema: Project, Category, Skill… (согласовать в чате) |
| PR → `dev` | PR → `dev` |

**schema.prisma:** перед правкой — сообщение в чат. После pull: `npx prisma generate` (обоим).

---

## Команды

```bash
git checkout anton   # или vlad
git pull origin dev

cd server && npm run dev
cd client && npm run dev
```
