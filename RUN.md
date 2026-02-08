# Как запустить проект

## Быстрый старт

1. Откройте **Node.js command prompt** (из меню Пуск после установки Node.js)  
   **или** обычный **cmd** / **PowerShell**, если `node` и `npm` уже в PATH.

2. Перейдите в папку проекта:
   ```
   cd "C:\Users\1\Downloads\metro-game-development (1)"
   ```

3. Запустите:
   ```
   npm run dev:vite
   ```
   (Vite работает без spawn EPERM; Next.js: `npm run dev`)

4. Откройте в браузере: **http://localhost:3000**

---

## Альтернатива: двойной клик

Запустите **`run-dev.bat`** двойным щелчком.  
Убедитесь, что Node.js установлен и доступен в PATH (через «Node.js command prompt» это так).

---

## Ошибка `spawn EPERM` (operation not permitted)

Если при `npm run dev` или `npm run build` появляется **`Error: spawn EPERM`**, попробуйте по шагам:

### 1. Другой путь к проекту

Скопируйте папку проекта в каталог **без пробелов и скобок**, например:

- `C:\metro-game`

Затем:

```
cd C:\metro-game
npm install
npm run dev
```

### 2. Запуск от имени администратора

Запустите **cmd** или **PowerShell** «От имени администратора», перейдите в папку проекта и снова выполните `npm run dev`.

### 3. Антивирус и безопасность Windows

Временно отключите антивирус или добавьте в исключения:

- папку проекта;
- `node.exe` (часто в `C:\Program Files\nodejs\`).

Проверьте, не блокирует ли **Защитник Windows** или другое ПО запуск дочерних процессов Node.

### 4. Варианты команд

- **Dev с webpack (без Turbopack):**  
  `npm run dev:webpack`

- **Сборка с webpack:**  
  `npm run build:webpack`

- **Production:**  
  Сначала `npm run build`, затем `npm run start`.  
  Откройте **http://localhost:3000**.

---

## Загрузка фото станций

Фото станций хранятся локально в `public/assets/stations/`. Для первичной загрузки выполните:

```
npm run download-photos
```

Скрипт скопирует имеющиеся фото из `public/img/` и загрузит недостающие из интернета.

---

## Проверка Node.js

В терминале выполните:

```
node -v
npm -v
```

Должны отображаться версии. Если команды не найдены — установите [Node.js](https://nodejs.org) и при установке отметьте опцию добавления в PATH.
