PWA-иконки.

Для боевого приложения замените icon-192.png, icon-512.png, icon-maskable-512.png и apple-touch-icon.png на свои.

Быстрый способ сгенерировать набор иконок из icon.svg:
  • https://realfavicongenerator.net  — загрузите icon.svg, скачайте набор и положите файлы сюда.
  • Либо локально: npx pwa-asset-generator public/icons/icon.svg public/icons

Файлы, которые ожидает приложение (см. app/layout.tsx и app/manifest.ts):
  - icons/icon-192.png            (192x192, любой purpose)
  - icons/icon-512.png            (512x512, любой purpose)
  - icons/icon-maskable-512.png   (512x512, maskable, безопасная зона 80%)
  - icons/apple-touch-icon.png    (180x180)

До замены приложение использует SVG-плейсхолдер.
