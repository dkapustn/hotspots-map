# HotSpots Map

Современное PWA-приложение для обмена крутыми местами (лавочки, виды, необычные локации). Метки можно создавать только из своей геолокации, посещения подтверждаются по физическому присутствию.

Стек: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · React-Leaflet · Supabase (Auth + Postgres + Storage) · PWA**.

---

## Быстрый старт

### 1. Установите зависимости

```bash
npm install
```

### 2. Создайте проект в Supabase

1. Зарегистрируйтесь на [supabase.com](https://supabase.com) (бесплатно).
2. Нажмите **New project**, выберите регион (для РФ ближе всего Frankfurt), задайте надёжный пароль БД.
3. Дождитесь, пока проект развернётся (~2 минуты).

### 3. Примените миграцию БД

1. Откройте **SQL Editor** в Supabase Dashboard.
2. Создайте новый запрос, вставьте содержимое файла [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql), выполните.
3. Этот скрипт создаст таблицы `profiles / spots / visits / likes / comments`, view `spot_stats`, RLS-политики, триггер автосоздания профиля и Storage-бакеты `spot-photos`/`avatars` с политиками.
4. Запусти второй файл — [`supabase/migrations/0002_realtime.sql`](./supabase/migrations/0002_realtime.sql) — чтобы карта обновлялась в реальном времени, когда другие пользователи создают метки.
5. Запусти третий файл — [`supabase/migrations/0003_follows.sql`](./supabase/migrations/0003_follows.sql) — таблица подписок + view `friendships` (взаимные подписки = друзья). RLS-политика запрещает анонимам подписываться.
6. (Опционально) Включи гостевой вход: **Authentication → Sign In / Up → Anonymous Sign-Ins** → переключи в **Allow**. После этого на странице входа появится рабочая кнопка «Войти как гость».

### 4. Скопируйте API ключи

В Supabase: **Settings → API**. Скопируйте:
- `Project URL`
- `anon public key`
- `service_role key` (нужен только если позже захотите серверные операции в обход RLS)

### 5. Настройте переменные окружения

Скопируйте файл-пример и подставьте свои ключи:

```bash
cp .env.local.example .env.local
```

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. (Опционально) Включите Google OAuth

1. В **Google Cloud Console** → APIs & Services → **Credentials** создайте **OAuth 2.0 Client ID** (тип Web application).
2. В поле **Authorized redirect URIs** добавьте:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Скопируйте **Client ID** и **Client Secret**.
4. В Supabase: **Authentication → Providers → Google** → включите, вставьте ключи, сохраните.

(Без этого шага кнопка «Войти через Google» вернёт ошибку провайдера — Email/пароль будет работать всегда.)

### 7. Запустите приложение

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). Перейдите на `/signup`, создайте аккаунт, разрешите геолокацию, создайте первую метку.

---

## Production-сборка

```bash
npm run build
npm run start
```

PWA service worker генерируется только в production. После `npm run build` приложение можно «Установить» в Chrome / добавить на главный экран iOS.

### Деплой на Vercel

1. Залейте проект в GitHub.
2. На [vercel.com](https://vercel.com) импортируйте репозиторий.
3. Добавьте переменные `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` в Project Settings → Environment Variables.
4. Если используете Google OAuth — добавьте в Google Cloud Console ещё один redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback` (он же; не меняется).
5. Deploy.

---

## Архитектурные особенности

- **Геолокация только при создании.** На экране `Создать` сначала запрашиваем `navigator.geolocation.getCurrentPosition` с `enableHighAccuracy: true`. Без полученных координат кнопка «Поделиться местом» неактивна.
- **Подтверждение визита.** Эндпоинт `POST /api/spots/[id]/visit` принимает координаты клиента, считает расстояние по формуле гаверсинуса до точки метки и сравнивает с радиусом из настроек профиля (по умолчанию 100 м). Если дальше — 422 + сообщение «подойдите ближе».
- **Сжатие фото.** На клиенте через `browser-image-compression` фото уменьшается до ≤ 1.2 MB / 2000px перед заливкой в Supabase Storage.
- **RLS.** Все таблицы защищены Row-Level Security: читают все, изменяет только владелец. Никаких backdoor service-role в публичном API.
- **PWA.** `manifest.ts` + `next-pwa` создают манифест и service worker. Иконки в `public/icons/` — SVG-плейсхолдер; для топового результата сгенерируйте набор PNG (см. `public/icons/README.txt`).
- **Адаптивность.** На мобильном — `BottomNav` + bottom sheets, на десктопе — `Sidebar` + диалоги.
- **Тема.** `next-themes` + CSS-переменные; светлая / тёмная / системная.

---

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run dev` | Запускает dev-сервер на :3000 |
| `npm run build` | Production-сборка + генерация SW |
| `npm run start` | Запуск production-сборки |
| `npm run lint` | ESLint |

---

## Структура

```
app/
  (auth)/        — login, signup, /auth/callback
  (main)/        — карта, создание, метка, топ, профиль, настройки
  api/           — REST-эндпоинты (spots, visits, likes, comments, profile)
components/
  map/           — Leaflet карта, маркеры
  spot/          — карточки и действия (Visit/Like/Comments)
  create/        — flow создания
  nav/           — BottomNav, DesktopSidebar
  ui/            — shadcn-style базовые компоненты
lib/
  supabase/      — client / server / middleware
  geo.ts         — Haversine, форматирование расстояния
  photo.ts       — compressImage, vibrate
  types.ts       — типы Database
supabase/
  migrations/    — 0001_init.sql
public/icons/    — иконки PWA
```

---

## Чек-лист проверки приложения

1. Запустить `npm run dev`, открыть `/login`.
2. Создать аккаунт через email или Google.
3. Разрешить геолокацию → синий маркер появляется на карте.
4. Нажать «+», добавить фото, заголовок → метка появляется на карте.
5. Открыть метку в инкогнито под другим аккаунтом → видна.
6. Нажать «Посетить» при настоящей геолокации (≤ 100 м) → визит подтверждён.
7. В DevTools → Sensors задать дальние координаты → визит отклонён с подсказкой.
8. Поставить лайк, написать комментарий — счётчики обновляются.
9. `/top` показывает сортировки по лайкам/визитам/новым.
10. `/profile` — три таба: мои, посещённые, лайкнутые.
11. `/profile/settings` — меняем имя, аватар, био, тему, радиус. Сохраняется.
12. В Chrome DevTools → Application → Manifest — манифест корректный, можно «Install».

---

## Лицензия

MIT.
