@echo off
chcp 65001 >nul
title Metro Game — Dev Server
cd /d "%~dp0"

echo.
echo ========================================
echo   Metro Game — запуск
echo ========================================
echo.

:: Проверка Node.js
where node >nul 2>&1
if errorlevel 1 (
  echo [ОШИБКА] Node.js не найден.
  echo Установите: https://nodejs.org
  echo Либо откройте "Node.js command prompt" и запустите start.bat снова.
  pause
  exit /b 1
)

:: Установка зависимостей при необходимости
if not exist "node_modules" (
  echo Установка зависимостей...
  call npm install
  if errorlevel 1 (
    echo [ОШИБКА] npm install не удался.
    pause
    exit /b 1
  )
  echo.
)

echo Запуск dev-сервера (Next.js)...
echo Открой в браузере: http://localhost:3000
echo Остановка: Ctrl+C
echo.

call npm run dev

if errorlevel 1 (
  echo.
  echo Если была ошибка spawn EPERM, запусти start-webpack.bat
  echo или вручную: npm run dev:webpack
)
echo.
pause
