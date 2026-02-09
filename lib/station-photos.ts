/**
 * Все фото станций — локально из папки игры: public/assets/stations/
 * Скачаны с Wikipedia (рус.) скриптом scripts/download-station-photos.mjs
 */

const STATIONS_ASSETS = "/assets/stations"

/** Станции, для которых есть фото в public/assets/stations/ (остальные — placeholder) */
const STATIONS_WITH_PHOTO = new Set([
  "aeroport", "babushkinskaya", "barrikadnaya", "belyaevo", "biblioteka-lenina",
  "botanichesky-sad", "chistye-prudy", "dobryninskaya", "izmaylovskaya", "kaluzhskaya",
  "kitay-gorod-6", "kolomenskaya", "komsomolskaya-1", "konkovo", "kotelniki",
  "krasnie-vorota", "krasnopresnenskaya", "krasnoselskaya", "kropotkinskaya", "kuzminki",
  "kuznetsky-most", "lermontovsky-prospekt", "lubyanka", "medvedkovo", "novokuznetskaya",
  "novoslobodskaya", "novoyasenevskaya", "novye-cheryomushki", "okhotny-ryad", "oktyabrskoe-pole",
  "park-kultury-1", "planernaya", "polezhaevskaya", "rechnoy-vokzal", "ryazansky-prospekt",
  "semyonovskaya", "shabolovskaya", "shchukinskaya", "shchyolkovskaya", "skhodnenskaya",
  "sokol", "sokolniki", "sviblovo", "tretyakovskaya-6", "turgenevskaya", "tushinskaya",
  "tverskaya", "tyoply-stan", "ulitsa-1905-goda", "universitet", "vdnkh", "vodny-stadion",
  "volgogradsky-prospekt", "vorobyovy-gory", "voykovskaya", "vykhino", "yasenevo", "zhulebino",
])

export function getStationPhotoUrl(stationId: string): string {
  if (STATIONS_WITH_PHOTO.has(stationId)) {
    return `${STATIONS_ASSETS}/${stationId}.jpg`
  }
  return `${STATIONS_ASSETS}/placeholder.jpg`
}
