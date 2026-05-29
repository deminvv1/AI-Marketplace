УЛУЧШЕНИЯ: 


1. Catalog / search — «нет в БД»
Что это
Catalog (каталог) — страница, где человек листает список: проекты, фрилансеры или готовые решения.
Search (поиск) — строка «найти по слову» + фильтры (отрасль, страна, тег).

Примеры:

Upwork: Browse Jobs, Find Freelancers
У вас: `/projects`, `/freelancers`, общий **`/search`** (см. `docs/SEARCH.md`)
Почему «нет в БД»
Данные уже есть в таблицах Project, Profile, Solution.
Каталог — это не новая сущность, а способ показать то, что в БД:

БД: Project (100 записей)
     ↓
API: GET /api/projects?industry=healthcare&country=DE
     ↓
Страница: список карточек + фильтры слева
Новая таблица Catalog не нужна — нужны страница + API с фильтрами.

**Статус:** сделано (каталог + `/search`).


2. Project alerts (бывш. Job alerts)
**Статус:** сделано на ветке anton
- Таблица **ProjectAlert** (`industry`, `country`, `q`, `tags`, `notifyByEmail`)
- При `POST /api/projects` — matcher → **Notification** + email (Resend)
- UI: `/project-alerts`, кнопка на `/projects`
- API: `/api/project-alerts`, `/api/notifications`



3. Skills / categories — справочник
**Статус:** сделано

Таблицы в БД:
- **Category** — industry (Medicine, Finance, …): `name`, `slug`, `icon`
- **Skill** — навыки для `tags[]`: `name`, `slug` (например `machine-learning`, `nlp`)

API:
- `GET /api/taxonomy` — категории + вложенные skills
- `GET /api/taxonomy/skills` — плоский список skills

Правила:
- При создании/редактировании Project, Forum, Solution, ProjectAlert, Profile.industries — **только значения из справочника**
- В БД в `tags[]` хранятся **slug** навыков (единый фильтр)
- В `industry` хранится **каноническое имя** категории

UI:
- `CategoryPicker` / `CategoryMultiPicker` — выбор industry
- `SkillTagPicker` — выбор skills чипами
- Миграция: `20260529180000_taxonomy` + seed



4. Proposal (отклик) — поля заявки
**Статус:** сделано (не «только message»)

| Поле в БД | UI на `/projects/[id]` | Зачем |
|-----------|------------------------|--------|
| `coverLetter` | Cover letter | Почему именно этот исполнитель |
| `proposedBudget` | Budget | Вилка цены без 10 переписок |
| `estimatedDays` | Timeline (days) | Сравнение сроков |

Заказчик видит список на странице проекта; фрилансер — `/proposals`.

Уведомления по откликам:
- **Accept** → `PROPOSAL_ACCEPTED` победителю (колокольчик)
- **Reject** (ручной) → `PROPOSAL_REJECTED` отклонённому
- **Accept** (auto-reject остальных pending) → `PROPOSAL_REJECTED` всем не выбранным («наняли другого»)



5. ProfileView
**Статус:** сделано — счётчик на профиле, `ProfileView` в БД



6. Completed projects на /profile
**Статус:** сделано — `GET /api/projects/completed/mine`, вкладка не заглушка



7. Forum comment edit
**Статус:** сделано — `PATCH` комментария, Edit на `/forum/[id]`



8. Messages, Report, BlockedUser
**Статус:** сделано
- `/messages` — реальный API 1:1, не mock
- `POST /api/reports`, `POST/DELETE /api/blocks`
- Report/Block на профиле фрилансера; blocked list в Settings → Privacy



Общая цепочка (логика продукта)

1. Вход и роль         
2. Client создаёт Project (industry + skills из справочника)
3. Залогиненные видят каталог (только после регистрации)
4. Freelancer → Proposal (cover letter, budget, days)
5. Client Accept → IN_PROGRESS + уведомления; остальные REJECTED + уведомления
6. Messages между пользователями (кроме block)
7. Профили + просмотры, Solutions, Forum, Reviews, Favorites, Search, Alerts
