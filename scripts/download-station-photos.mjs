#!/usr/bin/env node
/**
 * Скачивает фото станций из Wikipedia (рус.) и поездов из Wikimedia Commons.
 * Запуск: node scripts/download-station-photos.mjs
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const ASSETS_STATIONS = path.join(ROOT, "public", "assets", "stations")
const ASSETS_TRAINS = path.join(ROOT, "public", "images", "trains")
const IMG_DIR = path.join(ROOT, "public", "img")

const UA = "MoscowMetroGame/1.0 (educational project; https://github.com)"

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Парсим metro-data.ts: id и name для каждой станции */
function parseStations() {
  const content = fs.readFileSync(path.join(ROOT, "lib", "metro-data.ts"), "utf8")
  const list = []
  const re = /\{\s*id:\s*"([^"]+)"[^}]*?name:\s*"([^"]+)"[^}]*?line:\s*"/g
  let m
  while ((m = re.exec(content))) list.push({ id: m[1], name: m[2].trim() })
  return list
}

/** Получить URL главного изображения страницы ru.wikipedia.org */
async function getWikiImageUrl(pageTitle) {
  try {
    const url = `https://ru.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=800&piprop=original`
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15000) })
    if (!res.ok) return null
    const data = await res.json()
    const pages = data.query?.pages || {}
    const page = Object.values(pages)[0]
    if (!page || page.missing !== undefined) return null
    return page.original?.source || page.thumbnail?.source || null
  } catch {
    return null
  }
}

async function downloadTo(pathDest, imageUrl) {
  const res = await fetch(imageUrl, { headers: { "User-Agent": UA } })
  if (!res.ok) throw new Error(res.status)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(pathDest, buf)
}

// ——— Станции: копируем уже имеющиеся из /img, остальные качаем с Wikipedia ———
const LOCAL_IMG_MAP = {
  sokolniki: "Metro_MSK_Line1_Sokolniki.jpg",
  krasnoselskaya: "Metro_MSK_Line1_Krasnoselskaya_(img2).jpg",
  "komsomolskaya-1": "1280px-Komsomolskaya-radialnaya_(Комсомольская-радиальная)_(5229637662).jpg",
  "krasnie-vorota": "Metro_Krasnye_Vorota.jpg",
  "chistye-prudy": "MosMetro_Chistye_Prudy_asv2018-01.jpg",
  lubyanka: "MoscowMetro_Lubyanka_5871.jpg",
  "okhotny-ryad": "MosMetro_Okhotny_Ryad_img1_asv2018-01.jpg",
  "biblioteka-lenina": "Biblioteka_Imeni_Lenina_(Moscow_Metro)_-_interior.jpg",
  kropotkinskaya: "2560px-Metro_MSK_Line1_Kropotkinskaya.jpg",
  "park-kultury-1": "MoscowMetro_ParkKulturyRadialnaya_HB2.jpg",
}

if (!fs.existsSync(ASSETS_STATIONS)) {
  fs.mkdirSync(ASSETS_STATIONS, { recursive: true })
  console.log("Создана папка public/assets/stations/")
}

console.log("Станции: копирование локальных и загрузка с Wikipedia...\n")

for (const [id, filename] of Object.entries(LOCAL_IMG_MAP)) {
  const src = path.join(IMG_DIR, filename)
  const dest = path.join(ASSETS_STATIONS, `${id}.jpg`)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`  ✓ ${id} (локально)`)
  }
}

const stations = parseStations()
for (const { id, name } of stations) {
  const dest = path.join(ASSETS_STATIONS, `${id}.jpg`)
  if (fs.existsSync(dest)) {
    console.log(`  ✓ ${id} (уже есть)`)
    continue
  }
  const titles = [
    `${name} (станция метро)`,
    `${name} (станция Московского метрополитена)`,
    name,
  ]
  let imageUrl = null
  for (const title of titles) {
    imageUrl = await getWikiImageUrl(title)
    if (imageUrl) break
    await sleep(400)
  }
  if (imageUrl) {
    try {
      await downloadTo(dest, imageUrl)
      console.log(`  ✓ ${id} (Wikipedia)`)
    } catch (e) {
      console.log(`  ✗ ${id}: ${e.message}`)
    }
  }
  if (!imageUrl) {
    console.log(`  − ${id}: нет изображения в Wikipedia`)
  }
  await sleep(500)
}

// Placeholder для станций без фото
const placeholderSrc = path.join(ROOT, "public", "placeholder.jpg")
const placeholderDest = path.join(ASSETS_STATIONS, "placeholder.jpg")
if (fs.existsSync(placeholderSrc) && !fs.existsSync(placeholderDest)) {
  fs.copyFileSync(placeholderSrc, placeholderDest)
  console.log("  ✓ placeholder.jpg")
}

// ——— Поезда: известные URL с Wikimedia Commons ———
const TRAIN_IMAGES = [
  { id: "81-717", file: "81-717.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Moscow_metro_81-717.jpg/800px-Moscow_metro_81-717.jpg" },
  { id: "81-760", file: "oka.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Moscow_Metro_81-760_Oka.jpg/800px-Moscow_Metro_81-760_Oka.jpg" },
  { id: "81-765", file: "moskva.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Moscow_Metro_81-765_Moskva.jpg/800px-Moscow_Metro_81-765_Moskva.jpg" },
  { id: "81-775", file: "moskva2020.jpg", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Moscow_Metro_81-775_Moskva_2020.jpg/800px-Moscow_Metro_81-775_Moskva_2020.jpg" },
]
// 81-740 Русич: в игре используется oka.jpg (отдельного фото в Commons не подобрано)

if (!fs.existsSync(ASSETS_TRAINS)) {
  fs.mkdirSync(ASSETS_TRAINS, { recursive: true })
}

console.log("\nПоезда: загрузка с Wikimedia Commons...\n")

for (const { id, file, url } of TRAIN_IMAGES) {
  const dest = path.join(ASSETS_TRAINS, file)
  if (fs.existsSync(dest)) {
    console.log(`  ✓ ${file} (уже есть)`)
    continue
  }
  try {
    await downloadTo(dest, url)
    console.log(`  ✓ ${file} (загружено)`)
  } catch (e) {
    console.log(`  ✗ ${file}: ${e.message}`)
  }
  await sleep(300)
}

if (fs.existsSync(placeholderSrc)) {
  const trainPlaceholder = path.join(ASSETS_TRAINS, "placeholder.jpg")
  if (!fs.existsSync(trainPlaceholder)) {
    fs.copyFileSync(placeholderSrc, trainPlaceholder)
    console.log("  ✓ placeholder.jpg")
  }
}

console.log("\nГотово. Фото: public/assets/stations/, public/images/trains/")
