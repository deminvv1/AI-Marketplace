# Merge ветки `anton` → `dev` (без сюрпризов)

**Кто:** Антон готовит PR · **Влад** после merge на своей машине прогоняет миграции.

---

## Порядок (строго)

1. Убедиться, что `dev` актуален: `git fetch origin`
2. PR `anton` → `dev` (без force-push в `dev`)
3. После merge **оба** разработчика:

```bash
git checkout dev
git pull origin dev
cd server
npx prisma migrate deploy
npx prisma generate
npm run build
cd ../client && npm run build
```

4. Влад: проверить onboarding, register, settings (его зона)
5. Антон: smoke — projects, proposals, forum, search, project-alerts, taxonomy, messages, reports

---

## Миграции в этом merge (по порядку)

| Миграция | Содержание |
|----------|------------|
| `20260529120000_rename_domain_terminology` | Order→Project и т.д. |
| `20260529130000_add_profile_view` | ProfileView |
| `20260529140000_proposal_unique_per_freelancer` | unique отклик |
| `20260529150000_forum_post_likes` | ForumPostLike |
| `20260529160000_forum_comment_likes` | ForumCommentLike |
| `20260529170000_project_alerts` | ProjectAlert + индекс Notification |
| **`20260529180000_taxonomy`** | **Category + Skill, seed industries/skills** |

Если `migrate deploy` падает по сети — повторить; не делать `migrate reset` на shared Supabase.

---

## Новые env (server `.env`)

```env
# Опционально — email (project alerts + proposal accept/reject)
RESEND_API_KEY=
EMAIL_FROM=AI Marketplace <onboarding@resend.dev>
APP_URL=http://localhost:3000
```

Без `RESEND_API_KEY` письма не уходят, in-app уведомления работают.

---

## Новые Nest-модули (после merge)

| Модуль | API |
|--------|-----|
| `server/src/taxonomy/` | `GET /api/taxonomy`, `GET /api/taxonomy/skills` |
| `server/src/messages/` | conversations 1:1, send/list |
| `server/src/reports/` | `POST /api/reports` |
| `server/src/blocks/` | `POST/DELETE /api/blocks`, list blocked |

Подключены в `app.module.ts`.

---

## Что не трогает Влада (остаётся его зона)

- `auth/`, `onboarding/`, `users/`, `settings/` (кроме blocked list в Privacy — read-only UI)

## Согласовать с Владом после merge

- **`/messages`** — рабочий API + UI (не mock). Owner на доработку: один человек (real-time, вложения).
- **schema.prisma** — если Влад менял `User` / `Message` в `dev` параллельно.

## Что добавляет этот PR (маркетплейс)

- **Taxonomy** — справочник industry/skills, валидация при create/update, фильтры `?tag=` в каталогах
- **Proposal** — `coverLetter`, `proposedBudget`, `estimatedDays`; `PROPOSAL_ACCEPTED` / `PROPOSAL_REJECTED`; email на accept/reject
- **Search** — `GET /api/search?q=&tag=&industry=`
- **Forum** — edit/delete своих комментариев; edit темы
- **Profile** — completed projects (`GET /api/projects/completed/mine`)
- **Messages** — 1:1 чат, block check, polling UI
- **Safety** — reports (user, project, solution, forum_post), blocks; UI на карточках + settings
- См. `docs/TASKS.md`, `docs/new.md`, `docs/problems.md`

---

## Smoke после merge (5–10 мин)

| # | Действие |
|---|----------|
| 1 | Два пользователя: CLIENT создаёт проект (industry + skills из picker) |
| 2 | FREELANCER отклик с cover letter / budget / days |
| 3 | CLIENT Accept → IN_PROGRESS; второй отклик → REJECTED + уведомления (и email если Resend) |
| 4 | `/search?tag=` и фильтры industry на `/search` |
| 5 | `/messages?with=` с визитки / solution Contact |
| 6 | Report на проект / тему; Block в чате |
| 7 | `GET /api/taxonomy` — формы не принимают произвольные tags |

---

## Конфликты schema

Если Влад менял `schema.prisma` в `dev` параллельно — **согласовать в чате**, не мержить вслепую. Один `migrate dev` на объединённой схеме.
