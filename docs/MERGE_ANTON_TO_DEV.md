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
5. Антон: smoke — projects, proposals, forum, search, project-alerts

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

Если `migrate deploy` падает по сети — повторить; не делать `migrate reset` на shared Supabase.

---

## Новые env (server `.env`)

```env
# Опционально — email для Project alerts
RESEND_API_KEY=
EMAIL_FROM=AI Marketplace <onboarding@resend.dev>
APP_URL=http://localhost:3000
```

Без `RESEND_API_KEY` письма не уходят, in-app уведомления работают.

---

## Что не трогает Влада (остаётся его зона)

- `auth/`, `onboarding/`, `users/`, `settings/`
- Сообщения `/messages` — mock UI

## Что добавляет Антон (маркетплейс)

См. `docs/TASKS.md` — всё с ✅ до Project alerts / Search / Proposals.

---

## Конфликты schema

Если Влад менял `schema.prisma` в `dev` параллельно — **согласовать в чате**, не мержить вслепую. Один `migrate dev` на объединённой схеме.
