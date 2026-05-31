# Глобальный поиск `/search`

**Статус:** v1 · **Зона:** Антон (UI + существующие API)  
**В БД новых таблиц нет** — только агрегация уже существующих `GET` с параметром `q`.  
**Доступ:** только после регистрации (JWT), как и остальной маркетплейс.

---

## Зачем

Сейчас поиск разбросан: `/projects?q=`, фильтры на `/forum`, каталоги без общей строки.  
Пользователь не должен угадывать раздел — одна привычная точка входа, как на Upwork / LinkedIn.

---

## Как выглядит (UI)

```
┌─────────────────────────────────────────────────────────────┐
│  Search                                    [ Bell ]         │
├─────────────────────────────────────────────────────────────┤
│  🔍  [ LLM healthcare________________________ ]  [ Search ] │
│                                                             │
│  [ All ] [ Projects ] [ Freelancers ] [ Solutions ] [ Forum]│
│                                                             │
│  ── Projects (3) ──────────────────────── [ View all → ]   │
│  │ Card: title, industry, budget, country                  │
│  │ Card: …                                                 │
│                                                             │
│  ── Freelancers (2) ─────────────────── [ View all → ]   │
│  │ Card: name, rating, specialization                      │
│                                                             │
│  ── Solutions (1) · Forum (4) ── …                         │
└─────────────────────────────────────────────────────────────┘
```

- Стиль: те же `glass` карточки, что на `/projects` и `/freelancers`.
- Пустой `q`: подсказка «Enter a keyword…», без запросов к API.
- Нет результатов: «Nothing found for “…”» + ссылка сбросить фильтр.

---

## Как работает (логика)

| Шаг | Поведение |
|-----|-----------|
| 1 | Пользователь вводит текст в шапке **или** на `/search`. |
| 2 | Enter / кнопка Search → URL `/search?q=llm&tab=all` (можно шарить ссылку). |
| 3 | Debounce **300 ms** на странице `/search` при наборе. |
| 4 | Параллельно вызываются существующие API (см. ниже). |
| 5 | Вкладка **All** — до **5** карточек на секцию + «View all in Projects». |
| 6 | Вкладка **Projects** (и др.) — полный список только этого типа. |

### API (без нового бэкенда)

| Вкладка | Endpoint | Примечание |
|---------|----------|------------|
| Projects | `GET /api/projects?industry=&country=&q=` | только `OPEN` |
| Freelancers | `GET /api/freelancers?q=` | v1: поиск по имени, @username, specialization |
| Solutions | `GET /api/solutions?q=` | уже есть |
| Forum | `GET /api/forum/posts?q=` | уже есть |

**v1.1:** `GET /api/search?q=` на Nest — один запрос вместо четырёх (клиент `searchMarketplace` использует его).

---

## Навигация

- Пункт в сайдбаре: **Search** → `/search`.
- Поле в шапке `AppShell`: Enter → `/search?q=...`.
- «View all» на секции → тот же `q`, вкладка `tab=projects` и т.д.

---

## Кто и что не входит в v1

| Не в v1 | Позже |
|---------|--------|
| Полнотекстовый Elasticsearch | Prisma `contains` достаточно на старте |
| Поиск по сообщениям | зона чата (Влад) |
| AI-синонимы тегов | справочник Category/Skill из `docs/new.md` |

---

## Файлы (клиент)

- `client/src/app/search/page.tsx` — страница
- `client/src/app/actions/search.ts` — обёртки над `getProjects`, `getFreelancers`, …
- `client/src/components/app-shell.tsx` — ссылка Search + redirect из header input
