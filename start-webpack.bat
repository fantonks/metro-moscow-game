@echo off
chcp 65001 >nul
title Metro Game — Dev (Webpack, без Turbopack)
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo [ОШИБКА] Node.js не найден. Установите: https://nodejs.org
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Установка зависимостей...
  call npm install
  if errorlevel 1 ( pause & exit /b 1 )
)

echo Запуск: npm run dev:webpack
echo Браузер: http://localhost:3000
echo.
call npm run dev:webpack
pause
