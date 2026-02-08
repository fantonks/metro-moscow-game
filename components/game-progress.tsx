"use client"

import { Progress } from "@/components/ui/progress"
import { stations, getOpeningDates } from "@/lib/metro-data"
import {
  type GameState,
  getDailyMissionsCount,
  getDailyRewardLevel,
  DAILY_REWARDS,
} from "@/lib/game-store"
import { Train, Calendar, Star, Trophy } from "lucide-react"

interface GameProgressProps {
  gameState: GameState
  onFinalClick?: () => void
}

export function GameProgress({ gameState, onFinalClick }: GameProgressProps) {
  const totalStations = stations.filter((s) => !s.isSpecialLine).length
  const passedStations = gameState.passedStations.length
  const progress = totalStations > 0 ? (passedStations / totalStations) * 100 : 0
  const allPassed = passedStations >= totalStations
  const showFinalButton = allPassed && !gameState.finalQuizCompleted

  const dailyCount = getDailyMissionsCount(gameState)
  const { stars, title } = getDailyRewardLevel(dailyCount)

  const openingDates = getOpeningDates()
  const currentDate = openingDates[gameState.currentOpeningDateIndex]
  const formattedCurrentDate = currentDate
    ? new Date(currentDate).toLocaleDateString("ru-RU", { year: "numeric", month: "short" })
    : "—"

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
      <div className="bg-card/95 backdrop-blur-md rounded-xl shadow-2xl border border-border/50 p-4">
        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Train className="w-4 h-4 text-primary" />
            <span className="font-medium">{passedStations}</span>
            <span className="text-muted-foreground">/ {totalStations} станций</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">{formattedCurrentDate}</span>
          </div>
        </div>
        <div className="relative">
          <Progress value={progress} className="h-3 bg-muted" />
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
            style={{ left: `${Math.min(progress, 97)}%` }}
          >
            <div className="w-5 h-5 rounded-full bg-[#E42313] border-2 border-card shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">
            {progress.toFixed(1)}% исследовано
          </span>
          {showFinalButton && onFinalClick && (
            <button
              type="button"
              onClick={onFinalClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              Финал
            </button>
          )}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-muted-foreground">
              Миссии {dailyCount}/{DAILY_REWARDS.CHAMPION}
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i <= stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            {title && (
              <span className="text-[10px] font-medium text-amber-500">{title}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
