import type { Station } from "./metro-data"
import { lines } from "./metro-data"

/**
 * Возвращает данные для отображения в попапе (~3× объём).
 * При наличии extended использует их, иначе расширяет базовые.
 */
export function getStationDisplayData(station: Station): {
  description: string
  facts: string[]
} {
  if (station.extendedDescription && station.extendedFacts) {
    return {
      description: station.extendedDescription,
      facts: station.extendedFacts,
    }
  }

  const line = lines.find((l) => l.id === station.line)
  const lineName = line?.name ?? "метро"
  const year = station.openedDate.slice(0, 4)
  const depthNote =
    station.depth != null
      ? ` Глубина заложения — ${station.depth} м.`
      : ""

  const extraFacts: string[] = [
    `Входит в состав ${lineName} линии.`,
    `Открыта в ${year} году.`,
    ...(station.architect ? [`Архитектор: ${station.architect}`] : []),
    "Московский метрополитен — один из красивейших в мире.",
    "Многие станции — памятники архитектуры.",
  ]

  const expandedDescription = `${station.description}${depthNote}\n\nСтанция — часть Московского метрополитена, одной из крупнейших систем метро в мире. Первая линия открылась 15 мая 1935 года. ${station.architect ? `Архитектурное решение — ${station.architect}. ` : ""}Станции отличаются монументальностью и разнообразием стилей.`

  const allFacts = [...station.facts]
  for (const f of extraFacts) {
    if (allFacts.length >= 12) break
    const isDuplicate = allFacts.some(
      (existing) =>
        existing.includes(f.slice(0, 12)) || f.includes(existing.slice(0, 12))
    )
    if (!isDuplicate) allFacts.push(f)
  }

  return {
    description: expandedDescription,
    facts: allFacts,
  }
}
