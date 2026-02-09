#!/usr/bin/env sh
# Запуск dev-сервера (Linux / macOS)
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js not found. Install: https://nodejs.org"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting dev server... Open http://localhost:3000"
npm run dev
