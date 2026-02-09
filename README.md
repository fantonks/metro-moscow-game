# Метро Москвы — Исследуй историю

Интерактивная игра-энциклопедия о Московском метрополитене. Изучайте станции, проходите опросы и открывайте историю метро в хронологическом порядке.

- **Платформы:** Windows 10/11 (браузер или .exe), браузер, мобильные устройства.
- **Стек:** Next.js 16, React 19, TypeScript, Tailwind CSS. Desktop: Electron.
- **Изображения:** все картинки станций и поездов лежат в папке игры: `public/assets/stations/` (станции), `public/images/trains/` (поезда), `public/images/metro-map.jpg` (карта). Только локальные пути, работа офлайн.

---

## Одна команда — запуск с нуля

На ПК (после клонирования или распаковки архива):

```bash
npm install
npm run dev
```

Открой в браузере: **http://localhost:3000**

На Windows можно запустить **`start.bat`** двойным кликом (нужен установленный Node.js).

---

## Скрипты

| Команда | Описание |
|--------|----------|
| `npm run dev` | Dev-сервер (Next.js), hot reload |
| `npm run dev:webpack` | Dev без Turbopack (если EPERM) |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск production-сервера (после `build`) |
| `npm run download-photos` | Загрузка фото станций |
| `npm run build:electron` | Сборка статического экспорта для Electron |
| `npm run electron` | Запуск приложения в окне Electron (сначала `build:electron`) |
| `npm run pack:win` | Сборка .exe для Windows (установщик в `dist-electron/`) |

---

## Структура проекта

```
├── app/              # Next.js: страницы, layout, API
├── components/       # React-компоненты
├── lib/              # Данные и логика (станции, состояние игры)
├── hooks/            # React-хуки
├── public/           # Статика (карты, фото, иконки)
├── scripts/          # Вспомогательные скрипты
├── electron/         # Главный процесс Electron (desktop .exe)
├── start.bat         # Запуск на Windows
└── package.json
```

Все зависимости ставятся через `npm install`; в репозиторий не попадают `node_modules`, `.next`, `out` (см. `.gitignore`).

---

## Сохранение прогресса

- Прогресс хранится в **localStorage** (ключ `moscow-metro-game`).
- Автосохранение при каждом изменении состояния.
- Версионирование сохранений: в состоянии есть поле `version` для будущих миграций.

---

## Production и офлайн

- Сборка: `npm run build`
- Запуск: `npm run start` (порт 3000).
- Для работы без интернета: после `build` раздавать папку `.next` и `public` через любой статический сервер или использовать `next start` — приложение работает по локальной сети.

Подробнее: **[BUILD_AND_RUN.md](BUILD_AND_RUN.md)** — чистый ПК, запуск из архива, офлайн.

---

## Desktop-игра (Windows .exe)

1. Установить зависимости: `npm install`
2. Собрать статический экспорт и установщик:
   ```bash
   npm run pack:win
   ```
3. Готовый установщик будет в папке **`dist-electron/`** (например `Метро Москвы Setup x.x.x.exe`).
4. Установить и запускать двойным кликом. Игра работает **offline**, прогресс хранится локально (localStorage в профиле приложения Electron).
