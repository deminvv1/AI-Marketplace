# Закрытые пункты (справка)

- **Справочник industry/tags** — `Category` / `Skill`, `GET /api/taxonomy`, валидация при записи.
- **Каталоги** — `/projects`, `/forum`, `/solutions` берут фильтры из taxonomy (не `mock-data`), фильтр `?tag=` по skill slug.
- **Proposal fields** — `coverLetter`, `proposedBudget`, `estimatedDays`.
- **Уведомления reject** — `PROPOSAL_REJECTED` при ручном reject и при auto-reject на accept.
- **Поиск** — `GET /api/search` с `q`, `tag`, `industry` (как в каталогах); UI на `/search`.
- **Форум** — удаление своего комментария (+ ответы) в UI; API было раньше.
- **Email proposals** — accept/reject через Resend (`EmailService.sendProposalUpdate`), как project alerts.
- **Report** — project / solution / forum topic на карточках; user + block в `/messages`.
- **Messages** — polling 4s / 12s; Contact → `?with=userId` с solution.

После merge: `npx prisma migrate deploy` в `server/` (включая `20260529180000_taxonomy`).
