"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { type Station, generateQuizForStation, type QuizQuestion } from "@/lib/metro-data"

interface StationQuizProps {
  station: Station
  isOpen: boolean
  onClose: () => void
  onComplete: (passed: boolean) => void
}

export function StationQuiz({ station, isOpen, onClose, onComplete }: StationQuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [errors, setErrors] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [quizState, setQuizState] = useState<"playing" | "passed" | "failed">("playing")

  useEffect(() => {
    if (isOpen) {
      const generatedQuestions = generateQuizForStation(station)
      setQuestions(generatedQuestions)
      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setIsAnswered(false)
      setErrors(0)
      setCorrectAnswers(0)
      setQuizState("playing")
    }
  }, [isOpen, station])

  if (!isOpen || questions.length === 0) return null

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isCorrect = selectedAnswer === currentQuestion.correctIndex

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return
    
    setSelectedAnswer(index)
    setIsAnswered(true)
    
    if (index === currentQuestion.correctIndex) {
      setCorrectAnswers(prev => prev + 1)
    } else {
      const newErrors = errors + 1
      setErrors(newErrors)
      
      // Check if quiz is failed (2 errors)
      if (newErrors >= 2) {
        setTimeout(() => {
          setQuizState("failed")
        }, 1500)
        return
      }
    }
    
    // Check if this was the last question
    if (currentQuestionIndex === questions.length - 1) {
      setTimeout(() => {
        setQuizState("passed")
      }, 1500)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    }
  }

  const handleRetry = () => {
    const generatedQuestions = generateQuizForStation(station)
    setQuestions(generatedQuestions)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setErrors(0)
    setCorrectAnswers(0)
    setQuizState("playing")
  }

  const handleFinish = () => {
    onComplete(quizState === "passed")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[95vh] my-auto bg-card rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full shadow-sm" 
              style={{ backgroundColor: station.lineColor }}
            />
            <h2 className="text-base font-semibold text-foreground">
              Опрос: {station.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Quiz content с прокруткой */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {quizState === "playing" ? (
            <>
              {/* Progress */}
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

              {/* Question */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-foreground leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const isCorrectAnswer = index === currentQuestion.correctIndex
                  
                  let buttonStyle = "border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"
                  
                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      buttonStyle = "border-[#22c55e] bg-[#22c55e]/10 dark:bg-[#22c55e]/20 text-[#22c55e]"
                    } else if (isSelected && !isCorrectAnswer) {
                      buttonStyle = "border-red-500 bg-red-500/10 dark:bg-red-500/20 text-red-500"
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
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${buttonStyle} ${
                        !isAnswered ? "cursor-pointer" : "cursor-default"
                      }`}
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

              {/* Next button */}
              {isAnswered && currentQuestionIndex < questions.length - 1 && errors < 2 && (
                <Button 
                  onClick={handleNextQuestion}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Следующий вопрос
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </>
          ) : quizState === "passed" ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#22c55e]/10 dark:bg-[#22c55e]/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#22c55e]" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Отлично!
              </h3>
              <p className="text-muted-foreground mb-6">
                Вы успешно прошли опрос по станции «{station.name}»!
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Правильных ответов: {correctAnswers} из {questions.length}
              </p>
              <Button 
                onClick={handleFinish}
                className="w-full bg-[#22c55e] hover:bg-[#1fa34d] text-white"
              >
                Продолжить
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Опрос не пройден
              </h3>
              <p className="text-muted-foreground mb-6">
                Вы допустили 2 ошибки. Станция «{station.name}» остаётся закрытой.
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Повторить
                </Button>
                <Button 
                  onClick={handleFinish}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
