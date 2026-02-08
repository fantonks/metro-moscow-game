#!/usr/bin/env node
/** Обновляет photoUrl в metro-data.ts на локальные пути /assets/stations/{id}.jpg */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.join(__dirname, "..", "lib", "metro-data.ts")
let content = fs.readFileSync(filePath, "utf8")

content = content.replace(
  /(\{\s*id:\s*"([^"]+)"[\s\S]*?)\bphotoUrl:\s*["'][^"']+["']/g,
  (_, prefix, id) => `${prefix}photoUrl: "/assets/stations/${id}.jpg"`
)

fs.writeFileSync(filePath, content)
console.log("Обновлены пути photoUrl в lib/metro-data.ts")
