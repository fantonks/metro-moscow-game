"use client"

import { useState, useEffect } from "react"
import { X, Calendar, CheckCircle2, XCircle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { stations, type Station } from "@/lib/metro-data"
import { metroTrains, type MetroTrain } from "@/lib/metro-trains"
import { getStationPhotoUrl } from "@/lib/station-photos"
import type { GameState } from "@/lib/game-store"

interface DailyMissionProps {
  gameState: GameState
  isOpen: boolean
  onClose: () => void
  onComplete: (correct: boolean) => void
}

type QuizType = "station" | "train"

export function DailyMission({ gameState, isOpen, onClose, onComplete }: DailyMissionProps) {
  const [quizType, setQuizType] = useState<QuizType>("station")
  const [targetStation, setTargetStation] = useState<Station | null>(null)
  const [targetTrain, setTargetTrain] = useState<MetroTrain | null>(null)
  const [options, setOptions] = useState<Station[] | MetroTrain[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const useTrainQuiz = Math.random() < 0.35 && gameState.passedStations.length >= 4
      setQuizType(useTrainQuiz ? "train" : "station")

      if (useTrainQuiz) {
        const randomIndex = Math.floor(Math.random() * metroTrains.length)
        const target = metroTrains[randomIndex]
        setTargetTrain(target)
        const otherTrains = metroTrains
          .filter(t => t.id !== target.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        const allOptions = [target, ...otherTrains].sort(() => Math.random() - 0.5)
        setOptions(allOptions)
        setTargetStation(null)
      } else if (gameState.passedStations.length > 0) {
        const passedStationsList = stations.filter(s => 
          gameState.passedStations.includes(s.id)
        )
        
        if (passedStationsList.length < 4) return
        
        const randomIndex = Math.floor(Math.random() * passedStationsList.length)
        const target = passedStationsList[randomIndex]
        setTargetStation(target)
        
        const otherStations = passedStationsList
          .filter(s => s.id !== target.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        
        const allOptions = [target, ...otherStations].sort(() => Math.random() - 0.5)
        setOptions(allOptions)
        setTargetTrain(null)
      }
      
      setSelectedAnswer(null)
      setIsAnswered(false)
      setImageLoaded(false)
    }
  }, [isOpen, gameState.passedStations])

  useEffect(() => {
    if (isOpen && quizType === "train" && targetTrain && !targetTrain.photoUrl) {
      setImageLoaded(true)
    }
  }, [isOpen, quizType, targetTrain])

  if (!isOpen) return null

  const today = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long"
  })

  // Not enough stations
  if (gameState.passedStations.length < 4) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-xl bg-card rounded-xl shadow-2xl border border-border overflow-hidden p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ежедневная миссия
            </h3>
            <p className="text-muted-foreground mb-4">
              Пройдите минимум 4 станции, чтобы разблокировать ежедневные миссии!
            </p>
            <p className="text-sm text-muted-foreground">
              Пройдено: {gameState.passedStations.length} / 4
            </p>
          </div>
        </div>
      </div>
    )
  }

  const targetId = targetStation?.id ?? targetTrain?.id
  if (!targetId) return null

  const isCorrect = selectedAnswer === targetId

  const handleSelect = (id: string) => {
    if (isAnswered) return
    
    setSelectedAnswer(id)
    setIsAnswered(true)
  }

  const handleFinish = () => {
    onComplete(isCorrect)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[95vh] my-auto bg-card rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-[#E42313] to-[#ff4433] shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Ежедневная миссия</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{today}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content с прокруткой */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {!isAnswered ? (
            <>
              <h3 className="text-lg font-semibold text-foreground text-center mb-4">
                {quizType === "train" ? "Какой это поезд метро?" : "Какая это станция?"}
              </h3>
              
              {/* Photo */}
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden mb-6 border border-border">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
                {quizType === "train" && targetTrain ? (
                  targetTrain.photoUrl ? (
                    <img
                      src={targetTrain.photoUrl}
                      alt="Поезд метро"
                      className={`w-full h-full object-cover transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg"
                        setImageLoaded(true)
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl bg-muted">
                      🚇
                    </div>
                  )
                ) : (
                  <img
                    src={targetStation ? getStationPhotoUrl(targetStation.id) : "/placeholder.svg"}
                    alt="Станция метро"
                    className={`w-full h-full object-cover transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg"
                      setImageLoaded(true)
                    }}
                  />
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {options.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className="p-3 text-sm font-medium text-foreground bg-muted/50 hover:bg-muted rounded-lg border border-border transition-colors text-center"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              {isCorrect ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#22c55e]/10 dark:bg-[#22c55e]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-[#22c55e]" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Верно!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {quizType === "train"
                      ? `Это поезд «${targetTrain?.name}»`
                      : `Это станция «${targetStation?.name}»`}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Неверно
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Правильный ответ: «{targetStation?.name ?? targetTrain?.name}»
                  </p>
                </>
              )}
              
              <Button 
                onClick={handleFinish}
                className={`w-full ${isCorrect ? "bg-[#22c55e] hover:bg-[#1fa34d]" : "bg-primary hover:bg-primary/90"} text-white`}
              >
                Продолжить
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
