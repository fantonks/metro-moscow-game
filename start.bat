@echo off
chcp 65001 >nul
title Метро Москвы — запуск
cd /d "%~dp0"

echo.
echo ========================================
echo   Метро Москвы — одна кнопка запуска
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ОШИБКА] Node.js не найден. Установите: https://nodejs.org
  pause
  exit /b 1
)

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

echo Запуск сервера... Через несколько секунд откроется браузер.
echo.
:: Открыть браузер через 6 секунд (сервер успеет подняться)
start /b cmd /c "timeout /t 6 /nobreak >nul && start http://localhost:3000"

call npm run dev

if errorlevel 1 (
  echo.
  echo Если ошибка EPERM — запусти start-webpack.bat
)
pause
