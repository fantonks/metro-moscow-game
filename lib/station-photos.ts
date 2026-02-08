/**
 * Маппинг станций на локальные изображения в /img/
 * Для станций без фото используется placeholder
 */
const LOCAL_PHOTOS: Record<string, string> = {
  sokolniki: "/img/Metro_MSK_Line1_Sokolniki.jpg",
  krasnoselskaya: "/img/Metro_MSK_Line1_Krasnoselskaya_(img2).jpg",
  "komsomolskaya-1":
    "/img/1280px-Komsomolskaya-radialnaya_(Комсомольская-радиальная)_(5229637662).jpg",
  "krasnie-vorota": "/img/Metro_Krasnye_Vorota.jpg",
  "chistye-prudy": "/img/MosMetro_Chistye_Prudy_asv2018-01.jpg",
  lubyanka: "/img/MoscowMetro_Lubyanka_5871.jpg",
  "okhotny-ryad": "/img/MosMetro_Okhotny_Ryad_img1_asv2018-01.jpg",
  "biblioteka-lenina": "/img/Biblioteka_Imeni_Lenina_(Moscow_Metro)_-_interior.jpg",
  kropotkinskaya: "/img/2560px-Metro_MSK_Line1_Kropotkinskaya.jpg",
  "park-kultury-1": "/img/MoscowMetro_ParkKulturyRadialnaya_HB2.jpg",
}

export function getStationPhotoUrl(stationId: string): string {
  return LOCAL_PHOTOS[stationId] ?? "/placeholder.jpg"
}
