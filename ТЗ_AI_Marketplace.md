# ТЗ — AI Marketplace
# Международная платформа для заказчиков и исполнителей в сфере ИИ

---

## 1. ОБЩЕЕ ОПИСАНИЕ

**Название проекта:** AI Marketplace
**Тип:** International full-stack web platform — marketplace + community
**Концепция:** Первая международная платформа, объединяющая заказчиков и исполнителей в сфере искусственного интеллекта со всего мира.

**Две основные роли:**
- **Заказчик (Customer)** — размещает задачи/проекты в области ИИ
- **Исполнитель (Executor)** — предлагает ИИ-решения, откликается на заказы

**Ключевые разделы платформы:**
1. Форум (международный, с авто-переводом)
2. Готовые предложения (AI-продукты/решения на продажу)
3. Заказы (биржа задач)
4. Исполнители (каталог специалистов)

**Требования к продукту:** премиальный, современный, визуально красивый, технологичный, масштабируемый, production-ready.

---

## 2. СТЕК ТЕХНОЛОГИЙ

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes / Server Actions |
| База данных | PostgreSQL |
| ORM | Prisma |
| Auth | Supabase Auth (OTP email + OAuth: Google, Apple, Facebook, Telegram) |
| Realtime | Supabase Realtime (postgres_changes) |
| Storage | Supabase Storage (аватары, медиа, портфолио) |
| i18n | next-intl / i18next |
| Auto-translation | Google Translate API / DeepL API |
| Деплой | Vercel + Supabase cloud |

---

## 3. СХЕМА БАЗЫ ДАННЫХ

```prisma
model User {
  id         String      @id @default(cuid())
  email      String      @unique
  name       String?
  role       Role        @default(CUSTOMER)
  createdAt  DateTime    @default(now())
  profile    Profile?
  orders     Order[]
  messages   Message[]
  forumPosts ForumPost[]
}

model Profile {
  id             String   @id @default(cuid())
  userId         String   @unique
  bio            String?
  country        String?
  language       String?
  nickname       String?
  phone          String?
  avatar         String?
  specialization String?
  industries     String[]
  experience     String?
  achievements   String?
  rating         Float    @default(0)
  reviewsCount   Int      @default(0)
  onlineStatus   Boolean  @default(false)
  isPublic       Boolean  @default(true)
}

model Order {
  id               String    @id @default(cuid())
  title            String
  shortDescription String?
  description      String
  industry         String?
  tags             String[]
  budget           String?
  deadline         DateTime?
  country          String?
  language         String?
  workFormat       String?
  status           String    @default("open")
  authorId         String
  attachments      String[]
  createdAt        DateTime  @default(now())
}

model Offer {
  id          String   @id @default(cuid())
  title       String
  industry    String?
  description String
  format      String?
  price       String?
  preview     String?
  mediaUrls   String[]
  tags        String[]
  language    String?
  country     String?
  authorId    String
  createdAt   DateTime @default(now())
}

model Conversation {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  messages  Message[]
}

model Message {
  id             String   @id @default(cuid())
  content        String?
  audioUrl       String?
  senderId       String
  receiverId     String
  conversationId String
  createdAt      DateTime @default(now())
}

model ForumPost {
  id         String         @id @default(cuid())
  title      String
  content    String
  industry   String?
  tags       String[]
  authorId   String
  isPinned   Boolean        @default(false)
  likesCount Int            @default(0)
  createdAt  DateTime       @default(now())
  comments   ForumComment[]
}

model ForumComment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  authorId  String
  createdAt DateTime @default(now())
}

model Review {
  id         String   @id @default(cuid())
  rating     Int
  text       String?
  fromUserId String
  toUserId   String
  createdAt  DateTime @default(now())
}

model Complaint {
  id         String   @id @default(cuid())
  type       String
  targetId   String
  targetType String
  authorId   String
  status     String   @default("pending")
  createdAt  DateTime @default(now())
}

enum Role {
  CUSTOMER
  EXECUTOR
}
```

---

## 4. ГЛАВНАЯ СТРАНИЦА (до регистрации)

**Левая треть экрана:**
- Вертикальный список всех стран мира в алфавитном порядке (на английском)
- Поиск по странам
- Красивый кастомный scrollbar
- При клике на страну — выбор страны и языка интерфейса

**Правая две трети экрана:**
- Большой анимированный 3D-глобус в космосе
- Яркий, футуристичный, с мягким неоновым свечением
- Вокруг глобуса вращается название сайта + зверёк-талисман
- Анимация: плавная, cinematic, premium
- Эффекты: глубина, звёзды, облака света, slow rotation

**После выбора страны:**
- Fullscreen transition animation
- Эффект "падения из космоса на Землю"
- Камера приближается к планете → выбранной стране → столице → достопримечательности
- **Fallback:** если реалистичная 3D-навигация сложна для v1 — реализовать через видео/параллакс/CSS 3D-трансформации, сохранив идею "прибытия в страну"

---

## 5. ЛЕНДИНГ после выбора страны

- Страница приветствия на языке пользователя
- Крупный заголовок: *"Вы попали на первую международную платформу, которая объединяет специалистов-исполнителей и заказчиков в сфере ИИ-технологий со всего мира! Станьте одним из них!"*
- Две большие кнопки-карточки: **"Я заказчик"** / **"Я исполнитель"**
- Ниже — заголовок "Содержание" с 4 интерактивными карточками: Форум, Готовые предложения, Заказы, Исполнители

---

## 6. РЕГИСТРАЦИЯ И АВТОРИЗАЦИЯ

**Способы регистрации:**
- По email (OTP magic link)
- Google OAuth
- Apple OAuth
- Facebook OAuth
- Telegram OAuth
- Другие соцсети через OAuth

**После регистрации:**
- Пользователь выбирает роль: Заказчик / Исполнитель
- Реализовать возможность смены роли или совмещения ролей в будущем

**Доступ:**
- Все разделы платформы — только для зарегистрированных
- Незарегистрированные видят только главную страницу и лендинг

---

## 7. ЛИЧНЫЙ КАБИНЕТ И ПУБЛИЧНАЯ СТРАНИЦА

### А. Личный кабинет (только владелец)
- Смена аватара, никнейм, имя, email, телефон, пароль/безопасность
- Язык, страна
- Настройки уведомлений
- Управление сообщениями
- История действий
- Мои заказы / мои отклики / мои предложения
- Избранное, чёрный список
- Рейтинг, отзывы
- Статус онлайн
- Настройки приватности

### Б. Публичная страница (все зарегистрированные)
- Аватар, ник, страна, язык, рейтинг, отзывы
- Специализация, отрасли, описание
- Портфолио (изображения, видео, аудио, тексты, кейсы)
- Выполненные проекты
- Готовые предложения
- Активные заказы / история заказов
- Кнопки: "Написать", "Оставить голосовое сообщение", "Пригласить к сотрудничеству"

---

## 8. ФУНКЦИОНАЛ ЗАКАЗЧИКА

Заказчик может:
- Создать профиль, разместить заказ
- Выбрать отрасль и подкатегорию
- Подробно описать задачу, указать бюджет, сроки
- Прикрепить файлы и референсы
- Указать язык общения и формат работы
- Получать отклики исполнителей
- Добавлять исполнителей в избранное
- Общаться с исполнителями (текст + голос)
- Оценивать и оставлять отзывы
- Смотреть историю и статусы заказов

**Страница заказа содержит:**
заголовок, краткое описание, полное описание, отрасль, теги, бюджет, сроки, страна, язык, дата публикации, статус, отклики исполнителей, кнопка "Откликнуться / Связаться"

---

## 9. ФУНКЦИОНАЛ ИСПОЛНИТЕЛЯ

Исполнитель может:
- Создать подробный профиль (специализация, отрасли, опыт, достижения)
- Загрузить портфолио (изображения, видео, аудио, тексты, презентации, кейсы)
- Описать проекты и компании/проекты, с которыми работал
- Разместить готовые предложения
- Откликаться на заказы
- Общаться с заказчиками (текст + голос)
- Получать рейтинг и отзывы

**Карточка исполнителя:** аватар, ник, рейтинг, количество отзывов, специализация, отрасли, краткое bio, портфолио, готовые предложения, выполненные проекты, кнопка связи

---

## 10. ГОТОВЫЕ ПРЕДЛОЖЕНИЯ

Раздел, где исполнители размещают готовые ИИ-решения/продукты для:
- Покупки, лицензирования, адаптации, масштабирования, обсуждения сотрудничества

**Каждое предложение:** название, отрасль, описание, формат, цена / договорная, превью, изображения / видео / демо, кнопки "Связаться" / "Обсудить", рейтинг автора, теги, язык, страна

---

## 11. ФОРУМ

- Международный форум для всех зарегистрированных
- Функции: создание тем, комментарии, ответы, вопросы, кейсы, обсуждения ИИ по сферам и отраслям
- Сортировка: по популярности, новизне, отрасли, стране
- **Ключевая функция:** автоматический перевод — каждый пишет на своём языке, другие видят на своём (i18n + Translation API)
- Категории, поиск, закреплённые темы, лайки/реакции, модерация, жалобы на контент, подписка на темы

---

## 12. ЛИЧНЫЕ СООБЩЕНИЯ

- Система общения через публичную страницу + раздел сообщений
- Доступны пары: заказчик↔исполнитель, заказчик↔заказчик, исполнитель↔исполнитель
- **Типы:** текстовые, голосовые сообщения, онлайн-статус, история переписки, уведомления
- Полностью приватны — видны только участникам диалога

---

## 13. МНОГОЯЗЫЧНОСТЬ И ПЕРЕВОД

- Мультиязычный интерфейс (i18n)
- Автоопределение языка пользователя
- Ручной выбор языка
- Перевод: интерфейса, контента пользователей, форума, сообщений, описаний профилей / заказов / предложений
- Архитектура: **i18n layer + auto-translation layer**

---

## 14. ДИЗАЙН

**Стиль:** futuristic, premium, cinematic, elegant, international, tech luxury, AI marketplace aesthetic

**Использовать:**
- Тёмную тему как основную
- Яркие неоновые акценты (electric blue, violet, cyan)
- Glassmorphism
- Мягкие тени, глубокие градиенты
- Анимации, parallax, 3D-эффекты где уместно
- Адаптивность (desktop + mobile)
- Идеальная UX-навигация
- Главная страница — WOW-эффект

**Цветовая палитра:**
- Background: `#0A0A0F` (deep black), `#0D0D1A` (dark navy)
- Surface/cards: `rgba(255,255,255,0.05)` with backdrop-blur
- Primary accent: `#3B82F6` (electric blue) / `#6366F1` (indigo)
- Secondary accent: `#8B5CF6` (violet) / `#06B6D4` (cyan)
- Text primary: `#F8FAFC`
- Text secondary: `#94A3B8`
- Border: `rgba(255,255,255,0.1)`
- Success: `#10B981`, Warning: `#F59E0B`, Error: `#EF4444`

**Типографика:**
- Headings: Inter / Space Grotesk, bold/extrabold
- Body: Inter, regular/medium
- Code: JetBrains Mono

---

## 15. АДМИН-ПАНЕЛЬ

Для модераторов и администраторов:
- Управление пользователями
- Жалобы, блокировки
- Управление категориями
- Модерация: форума, заказов, готовых предложений
- Управление переводами
- Управление странами и языками
- Аналитика и отчёты

---

## 16. БЕЗОПАСНОСТЬ И МАСШТАБИРОВАНИЕ

- Role-based access control (RBAC)
- Private / public routes
- Secure auth (JWT / Supabase sessions)
- Валидация на всех входах (Zod)
- Anti-spam, rate limiting
- Moderation + content reporting
- Audit logs
- Scalable DB structure
- SEO для публичных частей
- Performance: image optimization, lazy loading, event tracking

---

## 17. MVP ROADMAP

### MVP (запуск)
- Регистрация + роли заказчик/исполнитель
- Профили (кабинет + публичная страница)
- Раздел заказов
- Каталог исполнителей
- Личные сообщения (текст)
- Базовый форум
- Категории по отраслям

### Phase 2
- Готовые предложения
- Рейтинги и отзывы
- Голосовые сообщения
- Мультиязычность + авто-перевод

### Phase 3
- 3D-глобус с анимацией "падения в страну"
- Умный подбор исполнителей / рекомендации
- Расширенная админ-панель
