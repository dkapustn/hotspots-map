# HotSpots Map — handoff для нового чата

> Если ты Claude Code и видишь этот файл — прочитай его целиком прежде чем что-то менять. Здесь история, договорённости и грабли проекта.

## Что это

PWA-приложение «карта крутых мест» (лавочки, виды, необычные локации).
Метку можно создать **только из своей реальной геолокации**. Кнопка
«Посетить» подтверждается на сервере по Haversine-расстоянию (RLS-радиус
по умолчанию 100м, настраивается в профиле).

Деплой: GitHub `dkapustn/hotspots-map` → Vercel автоматом.
Бэкенд: Supabase (Postgres + Auth + Storage).

## Стек (точные версии в `package.json`)

- **Next.js 14 (App Router)** + TypeScript
- **Tailwind CSS** + own «Liquid Glass» utilities в `globals.css`
- **React-Leaflet** + CARTO basemaps (Voyager / Positron / DarkMatter)
- **Supabase** (`@supabase/ssr` v0.5.x) — Auth + DB + Storage
- **next-pwa** (`@ducanh2912/next-pwa`)
- **Framer Motion**, **sonner** toasts, **lucide-react**, **zod**

## Архитектура

```
app/
  (auth)/login,signup         публичные, есть Suspense вокруг useSearchParams
  auth/callback/route.ts      OAuth + email-confirm
  (main)/                     protected (middleware → /login если !user)
    layout.tsx                fixed inset-0 flex + main + BottomNav (NOT внутри flex)
    page.tsx                  карта — server fetches spots → MapScreen
    map-screen.tsx            client; Realtime подписка на spots INSERT/DELETE
    create/                   flow с геолокацией + сжатие фото
    spot/[id]/                page.tsx server fetch + spot-detail.tsx client
    profile/                  свой профиль + [userId] публичный + settings
    top/                      рейтинг по likes/visits/new
  api/
    spots/route.ts            GET (bbox) + POST с геопроверкой
    spots/[id]/{route,visit,like,comments,rating,bookmark}/route.ts
    users/[id]/follow/route.ts
    profile/route.ts          PATCH профиль (вкл. spots_visibility)
components/
  nav/BottomNav.tsx           full-width solid bg-background, h-[68px], rounded-t-[24px]
                              ⚠ НЕ glass — пользователь несколько раз настаивал
                              что glass-фон НЕ совпадает с html bg
  map/                        Leaflet wrappers; MapView читает map-style из localStorage
  spot/                       Visit/Like/Share/Bookmark/Rating/Comments/PhotoLightbox/Distance
  user/FollowButton.tsx       3 состояния: Подписаться / Подписан / Друзья
  settings/AccentPicker, MapStylePicker, AccentInitializer
  pwa/InstallPrompt.tsx       beforeinstallprompt
  onboarding/Onboarding.tsx   3 экрана при первом запуске (localStorage флаг)
  ui/                         shadcn-стиль: Button, Card (glass), Sheet (glass), Dialog (glass)
lib/
  supabase/{client,server,middleware}.ts
  geo.ts                      haversineMeters, getCurrentPosition, formatDistance
  photo.ts                    compressImage, vibrate, getPublicPhotoUrl
  accent.ts                   6 пресетов: orange/red/purple/blue/teal/green
                              DEFAULT = purple. ⚠ розовый удалили
  map-styles.ts               voyager (default), positron, darkmatter
  types.ts                    Database type — поддерживается ВРУЧНУЮ при изменении схемы
  spot-helpers.ts             withPhotoUrl + attachAuthor (overload signatures)
supabase/migrations/
  0001_init.sql               profiles, spots, visits, likes, comments + RLS + триггер
                              handle_new_user + Storage buckets+policies
  0002_realtime.sql           ALTER PUBLICATION supabase_realtime ADD TABLE spots
  0003_follows.sql            follows + view friendships
                              ⚠ INSERT-policy запрещает анонимам подписываться
                              (через auth.jwt() ->> 'is_anonymous')
  0004_ratings.sql            ratings(1-5) + ПЕРЕСОБРАННЫЙ spot_stats с avg_rating
  0005_bookmarks_visibility.sql
                              bookmarks (приватные RLS) +
                              profiles.spots_visibility ('public'|'friends') +
                              ПЕРЕЗАПИСАННЫЙ spots_read policy с учётом друзей
```

## Договорённости с пользователем

### Дизайн / стиль

- **Liquid Glass** материал (`.glass`, `.glass-strong`, `.glass-shine`) — для Sheet,
  Dialog, Card, top-bar map, locate button. **НЕ для BottomNav** — там
  solid bg-background, иначе виден шов в iOS PWA. Пользователь измучил
  меня этим — НЕ возвращай glass на бар без явной просьбы.
- Акцент — **purple по умолчанию** (`hsl(270 75% 60%)`); CSS-переменные
  `--primary`/`--ring` уже выставлены в `:root` и `.dark`. AccentInitializer
  применяет сохранённый в localStorage цвет на маунте.
- Дизайн темы — **тёмный преферред**: `--background: hsl(222 25% 6%)`,
  `--glass-tint: rgb(30 33 44)` — подобран чтобы glass был чуть светлее фона.
- `next.config.mjs` имеет `typescript.ignoreBuildErrors: true` —
  supabase-js v2 generic-inference часто ломается на `.select().eq().single()`;
  build не падает но IDE подсказывает.

### Что удалили / чего нет

- ❌ **Розовый** акцент удалён из `lib/accent.ts`
- ❌ **Achievements** удалены (`components/profile/Achievements.tsx` нет)
- ❌ **`@next/next/no-img-element`** — отключён в next.config (используем `<img>`)
- ❌ **Liquid Glass на BottomNav** — пользователь категорически против

### Безопасность / RLS

- Все таблицы под RLS, читают все (кроме `bookmarks` — приватные).
- `spots_read` policy с 0005 учитывает visibility:
  своя метка ИЛИ owner.public ИЛИ взаимная подписка с owner.
- Анонимы (Supabase Anonymous Sign-In) НЕ могут:
  - подписываться (`follows_insert` проверяет JWT `is_anonymous`)
  - в UI: FollowButton показывает toast «зарегистрируйтесь»

## iOS PWA — выученные грабли

1. **`fixed bottom: 0` клиппится к safe-area-top** в standalone PWA.
   `transform: translateY(env(...))` НЕ работает на всех iOS-версиях.
   Решение для бара: solid bg-background = матчит html-цвет под ним,
   шва не видно даже если бар стоит на safe-area-top.
2. **`100dvh` тоже клиппится** в PWA standalone — used `fixed inset-0` на outer.
3. **PWA service-worker кэширует агрессивно**. После Vercel-деплоя пользователь
   может видеть старую версию. Совет: «удали PWA с домашнего экрана и переустанови».
4. **`env() в inline-style` через React может не вычисляться** на некоторых
   iOS — лучше Tailwind arbitrary value (`bottom-[calc(...)]`) или CSS-класс.

## Фичи (что уже сделано)

- Карта Leaflet с кастомными маркерами (фото-аватар в кружке)
- Кластеризация (react-leaflet-cluster)
- Realtime: новые метки появляются мгновенно через Supabase channel
- Геолокация при создании, Haversine при визите
- Сжатие фото на клиенте + загрузка в Supabase Storage
- Лайки, комментарии, **рейтинг 5 звёзд**, **закладки** (приватные)
- **Подписки + друзья** (взаимные = друзья), запрет для гостей
- **Видимость меток**: public / friends-only, фильтруется на уровне RLS
- Топ мест (по лайкам / визитам / новым) с поиском по названию+автору
- Профиль: свой + публичные `/profile/[userId]`; 6 статистик; табы
  мои/посещённые/лайкнутые/сохранённые
- Настройки: акцент (6 цветов), стиль карты (3), радиус посещения,
  тема (light/dark/system), видимость меток, удалить аккаунт
- Email + Google OAuth + **гостевой вход** (анонимный)
- PhotoLightbox, DistanceBadge, ShareButton (Web Share API)
- Onboarding (3 шага, localStorage)
- PWA InstallPrompt (beforeinstallprompt)
- Map state persistence (центр+зум в sessionStorage)

## Что НЕ забыть

- **Каждая новая SQL миграция** должна попасть в README шаг «3.X».
  Иначе пользователь не запустит её и приложение упадёт.
- При изменении схемы — **обновляй `lib/types.ts` вручную**
  (не используем supabase gen types).
- `spot_stats` — view, не таблица. Пересобирается в 0004 (добавил
  avg_rating) и в 0005 не трогается. Если добавишь поле — DROP+RECREATE.
- **FK-hint обязателен** в .select() с join'ом — иначе PostgREST падает
  с «more than one relationship was found»:
  `profiles!spots_user_id_fkey`, `spots!visits_spot_id_fkey`, и т.п.
- **PWA с следующим деплоем** обновляется не сразу. Не паникуй, если
  пользователь говорит «нет изменений» — попроси переустановить PWA.

## Как отлаживать

- `npm run dev` локально на :3000. `.env.local` нужен — см. `.env.local.example`.
- Превью через Claude Preview MCP: launch.json уже настроен (`hotspots-dev`).
- На iOS только Safari → Add to Home Screen для теста PWA standalone.

## Кредиты / экономия контекста

Этот чат разросся до огромного контекста (множество модификаций линтером,
автоматические system-reminders при каждом сообщении). Перенос в новый
чат =  reset. В новом чате:
- НЕ читай весь репо сразу — читай только то что меняешь
- Делай Edit вместо Write где можно (меньше токенов)
- Для подсказок про существующие фичи смотри сюда + README + миграции
