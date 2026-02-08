// Game state management with localStorage persistence
// Ежедневные миссии: 5→1★, 15→2★, 23→3★, 30→Чемпион

export interface GameState {
  passedStations: string[] // Array of station IDs
  currentOpeningDateIndex: number // Index in opening dates array
  quizErrors: Record<string, number> // Station ID -> error count
  completedDailyMissions: string[] // Date strings (YYYY-MM-DD) — миссии по дням
  lastDailyMissionDate: string | null
  isOnboardingComplete: boolean
  finalQuizCompleted: boolean
}

/** Пороги наград за ежедневные миссии */
export const DAILY_REWARDS = {
  STAR_1: 5,
  STAR_2: 15,
  STAR_3: 23,
  CHAMPION: 30,
} as const

export function getDailyMissionsCount(state: GameState): number {
  return state.completedDailyMissions.length
}

export function getDailyRewardLevel(count: number): { stars: number; title: string } {
  if (count >= DAILY_REWARDS.CHAMPION) return { stars: 3, title: "Чемпион" }
  if (count >= DAILY_REWARDS.STAR_3) return { stars: 3, title: "" }
  if (count >= DAILY_REWARDS.STAR_2) return { stars: 2, title: "" }
  if (count >= DAILY_REWARDS.STAR_1) return { stars: 1, title: "" }
  return { stars: 0, title: "" }
}

const STORAGE_KEY = 'moscow-metro-game'

const defaultState: GameState = {
  passedStations: [],
  currentOpeningDateIndex: 0,
  quizErrors: {},
  completedDailyMissions: [],
  lastDailyMissionDate: null,
  isOnboardingComplete: false,
  finalQuizCompleted: false,
}

export function loadGameState(): GameState {
  if (typeof window === 'undefined') return defaultState
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...defaultState, ...parsed }
    }
  } catch (e) {
    console.error('Failed to load game state:', e)
  }
  
  return defaultState
}

export function saveGameState(state: GameState): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save game state:', e)
  }
}

export function resetGameState(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

// Helper functions
export function isStationPassed(state: GameState, stationId: string): boolean {
  return state.passedStations.includes(stationId)
}

export function markStationPassed(state: GameState, stationId: string): GameState {
  if (state.passedStations.includes(stationId)) return state
  
  return {
    ...state,
    passedStations: [...state.passedStations, stationId]
  }
}

export function recordQuizError(state: GameState, stationId: string): GameState {
  const currentErrors = state.quizErrors[stationId] || 0
  return {
    ...state,
    quizErrors: {
      ...state.quizErrors,
      [stationId]: currentErrors + 1
    }
  }
}

export function getQuizErrors(state: GameState, stationId: string): number {
  return state.quizErrors[stationId] || 0
}

export function resetQuizErrors(state: GameState, stationId: string): GameState {
  const newErrors = { ...state.quizErrors }
  delete newErrors[stationId]
  return {
    ...state,
    quizErrors: newErrors
  }
}

export function advanceOpeningDate(state: GameState): GameState {
  return {
    ...state,
    currentOpeningDateIndex: state.currentOpeningDateIndex + 1
  }
}

export function completeDailyMission(state: GameState): GameState {
  const today = new Date().toISOString().split('T')[0]
  if (state.completedDailyMissions.includes(today)) return state
  
  return {
    ...state,
    completedDailyMissions: [...state.completedDailyMissions, today],
    lastDailyMissionDate: today
  }
}

export function isDailyMissionCompleted(state: GameState): boolean {
  const today = new Date().toISOString().split('T')[0]
  return state.completedDailyMissions.includes(today)
}

export function completeOnboarding(state: GameState): GameState {
  return {
    ...state,
    isOnboardingComplete: true
  }
}

export function completeFinalQuiz(state: GameState): GameState {
  return {
    ...state,
    finalQuizCompleted: true
  }
}
