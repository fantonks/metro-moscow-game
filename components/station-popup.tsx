"use client"

import { useState, useEffect } from "react"
import { X, Calendar, MapPin, Ruler, User, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Station, lines } from "@/lib/metro-data"
import { getStationPhotoUrl } from "@/lib/station-photos"
import { getStationDisplayData } from "@/lib/station-display"
import type { GameState } from "@/lib/game-store"

interface StationPopupProps {
  station: Station
  gameState: GameState
  isOpen: boolean
  anchor?: { x: number; y: number }
  onClose: () => void
  onStartQuiz: () => void
}

const PADDING = 16

export function StationPopup({
  station,
  gameState,
  isOpen,
  onClose,
  onStartQuiz,
}: StationPopupProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const isPassed = gameState.passedStations.includes(station.id)
  const line = lines.find((l) => l.id === station.line)
  const { description, facts } = getStationDisplayData(station)
  const photoUrl = getStationPhotoUrl(station.id)

  const formattedDate = new Date(station.openedDate).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  useEffect(() => {
    if (station.id) {
      setImageLoaded(false)
    }
  }, [station.id])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 dark:bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[95vh] max-h-[95vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка закрытия */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
          aria-label="Закрыть"
        >
          <X className="w-7 h-7" />
        </button>

        {/* Картинка станции — крупная */}
        <div className="relative w-full aspect-[16/9] min-h-[180px] max-h-[40vh] bg-muted shrink-0">
          <img
            src={photoUrl}
            alt={`Станция ${station.name}`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="w-10 h-10 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 pt-16">
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-full shrink-0 shadow-lg"
                style={{ backgroundColor: station.lineColor }}
              />
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white drop-shadow-lg">
                {station.name}
              </h2>
              {isPassed && (
                <CheckCircle2 className="w-7 h-7 text-[#22c55e] shrink-0 drop-shadow" />
              )}
            </div>
            {line && (
              <p className="text-white/90 text-sm mt-1">{line.name}</p>
            )}
          </div>
        </div>

        {/* Контент с прокруткой */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="p-6 pb-8 space-y-6">
            {/* Главная информация */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                <Calendar className="w-6 h-6 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Открыта</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formattedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                <MapPin
                  className="w-6 h-6 shrink-0"
                  style={{ color: station.lineColor }}
                />
                <div>
                  <p className="text-xs text-muted-foreground">Линия</p>
                  <p className="text-sm font-semibold text-foreground">
                    {line?.name ?? "—"}
                  </p>
                </div>
              </div>
              {station.depth != null && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                  <Ruler className="w-6 h-6 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Глубина</p>
                    <p className="text-sm font-semibold text-foreground">
                      {station.depth} м
                    </p>
                  </div>
                </div>
              )}
              {station.architect && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                  <User className="w-6 h-6 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Архитектор</p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {station.architect}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Описание */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 font-serif">
                О станции
              </h3>
              <div className="text-base text-muted-foreground leading-relaxed space-y-3">
                {description.split(/\n\n+/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {/* Факты */}
            {facts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 font-serif">
                  Интересные факты
                </h3>
                <ul className="space-y-2">
                  {facts.map((fact, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-base text-muted-foreground"
                    >
                      <span
                        className="w-2 h-2 rounded-full mt-2 shrink-0"
                        style={{ backgroundColor: station.lineColor }}
                      />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Кнопка опроса — фиксирована внизу, не перекрывает контент */}
        <div className="p-4 border-t border-border bg-card shrink-0">
          {isPassed ? (
            <div className="flex items-center justify-center gap-3 py-4 bg-[#22c55e]/10 dark:bg-[#22c55e]/20 rounded-xl border border-[#22c55e]/30">
              <CheckCircle2 className="w-6 h-6 text-[#22c55e]" />
              <span className="text-base font-medium text-[#22c55e]">
                Ты прошёл опрос по этой станции!
              </span>
            </div>
          ) : (
            <Button
              onClick={onStartQuiz}
              className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            >
              Пройти опрос по станции
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
