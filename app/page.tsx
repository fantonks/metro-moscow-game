"use client"

import { useState, useEffect, useCallback } from "react"
import { MetroMap } from "@/components/metro-map"
import { StationPopup } from "@/components/station-popup"
import { StationQuiz } from "@/components/station-quiz"
import { GameProgress } from "@/components/game-progress"
import { Onboarding } from "@/components/onboarding"
import { DailyMission } from "@/components/daily-mission"
import { FinalQuiz } from "@/components/final-quiz"
import { TrainsInfo } from "@/components/trains-info"
import { type Station, getOpeningDates, getStationsOpenedOn } from "@/lib/metro-data"
import {
  type GameState,
  loadGameState,
  saveGameState,
  markStationPassed,
  advanceOpeningDate,
  completeOnboarding,
  completeDailyMission,
  isDailyMissionCompleted,
  resetQuizErrors
} from "@/lib/game-store"
import { Sparkles, RotateCcw, Train } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { SplashScreen } from "@/components/splash-screen"
import { playClickSound } from "@/lib/sound"

export default function MetroGame() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [popupAnchor, setPopupAnchor] = useState<{ x: number; y: number } | undefined>()
  const [showPopup, setShowPopup] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showDailyMission, setShowDailyMission] = useState(false)
  const [showFinalQuiz, setShowFinalQuiz] = useState(false)
  const [showTrainsInfo, setShowTrainsInfo] = useState(false)
  const [splashDone, setSplashDone] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loaded = loadGameState()
    setGameState(loaded)
    setShowOnboarding(!loaded.isOnboardingComplete)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (gameState) saveGameState(gameState)
  }, [gameState])

  const handleStationClick = useCallback((station: Station, anchor: { x: number; y: number }) => {
    playClickSound()
    setSelectedStation(station)
    setPopupAnchor(anchor)
    setShowPopup(true)
  }, [])

  const handleClosePopup = useCallback(() => {
    setShowPopup(false)
    setSelectedStation(null)
    setPopupAnchor(undefined)
  }, [])

  const handleStartQuiz = useCallback(() => {
    setShowPopup(false)
    setShowQuiz(true)
  }, [])

  const handleCloseQuiz = useCallback(() => {
    setShowQuiz(false)
    setSelectedStation(null)
  }, [])

  const handleQuizComplete = useCallback((passed: boolean) => {
    if (!gameState || !selectedStation) return
    if (passed) {
      let newState = markStationPassed(gameState, selectedStation.id)
      newState = resetQuizErrors(newState, selectedStation.id)
      const openingDates = getOpeningDates()
      const currentDate = openingDates[newState.currentOpeningDateIndex]
      const stationsForCurrentDate = getStationsOpenedOn(currentDate)
      const allCurrentDatePassed = stationsForCurrentDate.every((s) =>
        newState.passedStations.includes(s.id)
      )
      if (allCurrentDatePassed && newState.currentOpeningDateIndex < openingDates.length - 1) {
        newState = advanceOpeningDate(newState)
      }
      setGameState(newState)
    }
    setShowQuiz(false)
    setSelectedStation(null)
  }, [gameState, selectedStation])

  const handleOnboardingComplete = useCallback(() => {
    if (!gameState) return
    setGameState(completeOnboarding(gameState))
    setShowOnboarding(false)
  }, [gameState])

  const handleDailyMissionComplete = useCallback((correct: boolean) => {
    if (!gameState) return
    if (correct) setGameState(completeDailyMission(gameState))
    setShowDailyMission(false)
  }, [gameState])

  const handleResetGame = useCallback(() => {
    if (confirm("Вы уверены, что хотите сбросить весь прогресс?")) {
      localStorage.removeItem("moscow-metro-game")
      setGameState(loadGameState())
      setShowOnboarding(true)
    }
  }, [])

  if (!splashDone) {
    return <SplashScreen onComplete={() => setSplashDone(true)} />
  }

  if (isLoading || !gameState) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-6 border-3 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  const dailyMissionAvailable = !isDailyMissionCompleted(gameState)

  return (
    <main className="fixed inset-0 overflow-hidden bg-background">
      <MetroMap gameState={gameState} onStationClick={handleStationClick} />
      <GameProgress
        gameState={gameState}
        onFinalClick={() => {
          playClickSound()
          setShowFinalQuiz(true)
        }}
      />
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => {
            playClickSound()
            setShowTrainsInfo(true)
          }}
          className="p-2 rounded-lg bg-card/90 backdrop-blur-sm border border-border hover:bg-card transition-colors"
          title="Поезда метро"
        >
          <Train className="w-5 h-5 text-foreground" />
        </button>
        <ThemeToggle />
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10 gap-3">
        <button
          type="button"
          onClick={handleResetGame}
          className="p-2 bg-card/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-card border border-border transition-colors"
          aria-label="Сбросить прогресс"
        >
          <RotateCcw className="w-5 h-5 text-foreground" />
        </button>
        <Button
          onClick={() => {
            playClickSound()
            setShowDailyMission(true)
          }}
          className={`shadow-lg ${
            dailyMissionAvailable
              ? "bg-gradient-to-r from-[#E42313] to-[#ff4433] hover:from-[#c41f11] hover:to-[#e63d2d] text-white"
              : "bg-muted text-muted-foreground"
          }`}
          disabled={!dailyMissionAvailable || gameState.passedStations.length < 4}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {dailyMissionAvailable ? "Ежедневная миссия" : "Миссия выполнена"}
        </Button>
      </div>
      <Onboarding isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
      {selectedStation && (
        <StationPopup
          station={selectedStation}
          gameState={gameState}
          isOpen={showPopup}
          anchor={popupAnchor}
          onClose={handleClosePopup}
          onStartQuiz={handleStartQuiz}
        />
      )}
      {selectedStation && (
        <StationQuiz
          station={selectedStation}
          isOpen={showQuiz}
          onClose={handleCloseQuiz}
          onComplete={handleQuizComplete}
        />
      )}
      <DailyMission
        gameState={gameState}
        isOpen={showDailyMission}
        onClose={() => setShowDailyMission(false)}
        onComplete={handleDailyMissionComplete}
      />
      <FinalQuiz
        gameState={gameState}
        isOpen={showFinalQuiz}
        onClose={() => setShowFinalQuiz(false)}
        onComplete={(newState) => {
          setGameState(newState)
          setShowFinalQuiz(false)
        }}
      />
      <TrainsInfo isOpen={showTrainsInfo} onClose={() => setShowTrainsInfo(false)} />
    </main>
  )
}
