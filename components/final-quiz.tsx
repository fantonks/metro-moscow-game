"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { stations, generateFinalQuizQuestions, type QuizQuestion } from "@/lib/metro-data"
import { type GameState, getDailyMissionsCount, completeFinalQuiz } from "@/lib/game-store"

interface FinalQuizProps {
  gameState: GameState
  isOpen: boolean
  onClose: () => void
  onComplete: (state: GameState) => void
}

export function FinalQuiz({ gameState, isOpen, onClose, onComplete }: FinalQuizProps) {
  const [stage, setStage] = useState<"intro" | "quiz" | "congrats">("intro")
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [errors, setErrors] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [quizState, setQuizState] = useState<"playing" | "passed" | "failed">("playing")

  const totalStations = stations.filter((s) => !s.isSpecialLine).length
  const allPassed = gameState.passedStations.length >= totalStations

  useEffect(() => {
    if (isOpen && stage === "intro") {
      setStage("intro")
    }
  }, [isOpen, stage])

  const handleStartQuiz = () => {
    const passedStationsList = stations.filter((s) =>
      gameState.passedStations.includes(s.id) && !s.isSpecialLine
    )
    const q = generateFinalQuizQuestions(passedStationsList)
    setQuestions(q)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setErrors(0)
    setCorrectAnswers(0)
    setQuizState("playing")
    setStage("quiz")
  }

  useEffect(() => {
    if (stage === "quiz" && questions.length > 0 && currentQuestionIndex >= questions.length) {
      setQuizState("passed")
    }
  }, [stage, questions.length, currentQuestionIndex])

  if (!isOpen) return null

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return

    setSelectedAnswer(index)
    setIsAnswered(true)

    if (index === currentQuestion.correctIndex) {
      setCorrectAnswers((prev) => prev + 1)
    } else {
      const newErrors = errors + 1
      setErrors(newErrors)
      if (newErrors >= 3) {
        setTimeout(() => setQuizState("failed"), 1500)
        return
      }
    }

    if (currentQuestionIndex >= questions.length - 1) {
      setTimeout(() => setQuizState("passed"), 1500)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    }
  }

  const handleRetry = () => {
    handleStartQuiz()
  }

  const handleFinishQuiz = () => {
    if (quizState === "passed") {
      onComplete(completeFinalQuiz(gameState))
    }
    onClose()
  }

  const handleFinishCongrats = () => {
    onComplete(completeFinalQuiz(gameState))
    onClose()
  }

  if (stage === "intro") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-xl max-h-[95vh] my-auto bg-card rounded-xl shadow-2xl border border-border overflow-hidden p-6 overflow-y-auto">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Поздравляю с прохождением игры!
            </h3>
            <p className="text-muted-foreground mb-6">
              Пройди финальный опрос по всем станциям!
            </p>
            <Button
              onClick={handleStartQuiz}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              Начать финальный опрос
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (stage === "quiz" && questions.length > 0) {
    if (quizState === "playing" && !currentQuestion) return null

    if (quizState === "passed") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[95vh] my-auto bg-card rounded-xl shadow-2xl border border-border overflow-hidden p-6 overflow-y-auto">
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-[#22c55e]" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Поздравляем с прохождением!
              </h3>
              <p className="text-muted-foreground mb-6">
                Вы успешно прошли финальный опрос!
              </p>
              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left space-y-2">
                <p className="text-sm font-medium text-foreground">
                  📊 Статистика игрока
                </p>
                <p className="text-sm text-muted-foreground">
                  Пройдено станций: {gameState.passedStations.length} / {totalStations}
                </p>
                <p className="text-sm text-muted-foreground">
                  Правильных ответов в финале: {correctAnswers} / {questions.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ежедневных миссий: {getDailyMissionsCount(gameState)}
                </p>
              </div>
              <Button
                onClick={handleFinishCongrats}
                className="w-full bg-[#22c55e] hover:bg-[#1fa34d] text-white"
              >
                Завершить
              </Button>
            </div>
          </div>
        </div>
      )
    }

    if (quizState === "failed") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[95vh] my-auto bg-card rounded-xl shadow-2xl border border-border overflow-hidden p-6 overflow-y-auto">
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Финальный опрос не пройден
              </h3>
              <p className="text-muted-foreground mb-6">
                Вы допустили 3 ошибки. Попробуйте ещё раз!
              </p>
              <div className="flex gap-3">
                <Button onClick={handleRetry} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Повторить
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Закрыть
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const isCorrect = selectedAnswer === currentQuestion.correctIndex

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
        <div className="relative w-full max-w-2xl max-h-[95vh] my-auto bg-card rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-amber-500/20 to-amber-600/20 shrink-0">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-foreground">
                Финальный опрос
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-muted rounded-full"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Вопрос {currentQuestionIndex + 1} из {questions.length}</span>
                <span className="flex items-center gap-2">
                  <span className="text-[#22c55e]">{correctAnswers} верно</span>
                  <span className="text-red-500">{errors} ошибок</span>
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-muted" />
            </div>

            <h3 className="text-lg font-medium text-foreground leading-relaxed mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index
                const isCorrectAnswer = index === currentQuestion.correctIndex

                let buttonStyle = "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"

                if (isAnswered) {
                  if (isCorrectAnswer) {
                    buttonStyle = "border-[#22c55e] bg-[#22c55e]/10 text-[#22c55e]"
                  } else if (isSelected && !isCorrectAnswer) {
                    buttonStyle = "border-red-500 bg-red-500/10 text-red-500"
                  } else {
                    buttonStyle = "border-border bg-muted/30 text-muted-foreground"
                  }
                }

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${buttonStyle}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{option}</span>
                      {isAnswered && isCorrectAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
                      )}
                      {isAnswered && isSelected && !isCorrectAnswer && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {isAnswered && currentQuestionIndex < questions.length - 1 && errors < 3 && (
              <Button
                onClick={handleNextQuestion}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Следующий вопрос
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {isAnswered && currentQuestionIndex >= questions.length - 1 && errors < 3 && (
              <Button
                onClick={() => {
                  setQuizState("passed")
                }}
                className="w-full bg-[#22c55e] hover:bg-[#1fa34d] text-white"
              >
                Завершить опрос
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
