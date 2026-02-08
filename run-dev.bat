@echo off
chcp 65001 >nul
title Метро — dev
cd /d "%~dp0"

echo.
echo  Запуск dev-сервера...
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js не найден в PATH.
  echo Установите Node.js: https://nodejs.org
  echo Либо откройте "Node.js command prompt" и снова запустите run-dev.bat
  pause
  exit /b 1
)

call npm run dev:vite

echo.
echo Сервер остановлен.
pause
