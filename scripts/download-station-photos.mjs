#!/usr/bin/env node
/**
 * Скрипт загрузки фото станций.
 * Парсит lib/metro-data.ts, копирует из /img или загружает по URL.
 * Запуск: node scripts/download-station-photos.mjs
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const ASSETS_DIR = path.join(ROOT, "public", "assets", "stations")
const IMG_DIR = path.join(ROOT, "public", "img")

// Копирование из /img для станций с локальными путями
const LOCAL_IMG_MAP = {
  sokolniki: "Metro_MSK_Line1_Sokolniki.jpg",
  krasnoselskaya: "Metro_MSK_Line1_Krasnoselskaya_(img2).jpg",
  "komsomolskaya-1":
    "1280px-Komsomolskaya-radialnaya_(Комсомольская-радиальная)_(5229637662).jpg",
  "krasnie-vorota": "Metro_Krasnye_Vorota.jpg",
  "chistye-prudy": "MosMetro_Chistye_Prudy_asv2018-01.jpg",
  lubyanka: "MoscowMetro_Lubyanka_5871.jpg",
  "okhotny-ryad": "MosMetro_Okhotny_Ryad_img1_asv2018-01.jpg",
  "biblioteka-lenina": "Biblioteka_Imeni_Lenina_(Moscow_Metro)_-_interior.jpg",
  kropotkinskaya: "2560px-Metro_MSK_Line1_Kropotkinskaya.jpg",
  "park-kultury-1": "MoscowMetro_ParkKulturyRadialnaya_HB2.jpg",
}

// Парсим metro-data.ts для извлечения id и photoUrl
function parseMetroData() {
  const content = fs.readFileSync(path.join(ROOT, "lib", "metro-data.ts"), "utf8")
  const result = []
  const blockRegex = /\{\s*id:\s*"([^"]+)"[\s\S]*?photoUrl:\s*["']([^"']+)["']/g
  let m
  while ((m = blockRegex.exec(content))) {
    result.push({ id: m[1], photoUrl: m[2] })
  }
  return result
}

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true })
  console.log("Создана папка public/assets/stations/")
}

// 1. Копируем из /img
for (const [id, filename] of Object.entries(LOCAL_IMG_MAP)) {
  const src = path.join(IMG_DIR, filename)
  const dest = path.join(ASSETS_DIR, `${id}.jpg`)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`✓ ${id} (копия)`)
  }
}

async function download(id, url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "MoscowMetroGame/1.0" },
    })
    if (!res.ok) throw new Error(res.status)
    const buf = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(path.join(ASSETS_DIR, `${id}.jpg`), buf)
    console.log(`✓ ${id} (загружено)`)
  } catch (e) {
    console.log(`✗ ${id}: ${e.message}`)
  }
}

// 2. Загружаем по URL из metro-data
const stations = parseMetroData()
console.log("\nЗагрузка фото по URL из metro-data...")
for (const { id, photoUrl } of stations) {
  if (photoUrl.startsWith("http")) {
    const dest = path.join(ASSETS_DIR, `${id}.jpg`)
    if (!fs.existsSync(dest)) {
      await download(id, photoUrl)
    } else {
      console.log(`✓ ${id} (уже есть)`)
    }
  }
}

console.log("\nГотово. Фото в public/assets/stations/")
