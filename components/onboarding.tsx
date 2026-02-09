"use client"

import { useState } from "react"
import { Train, MapPin, BookOpen, Trophy, ArrowRight } from "lucide-react"

interface OnboardingProps {
  isOpen: boolean
  onComplete: () => void
}

const steps = [
  {
    icon: Train,
    title: "Добро пожаловать в Метро Москвы!",
    description: "Исследуйте историю Московского метрополитена, изучая станции в порядке их открытия."
  },
  {
    icon: MapPin,
    title: "Открывайте станции",
    description: "Станции открываются по датам их исторического открытия. Начните с «Сокольников» — первой станции метро."
  },
  {
    icon: BookOpen,
    title: "Изучайте историю",
    description: "Каждая станция содержит фотографии, факты об архитектуре и истории. Узнайте, кто построил метро."
  },
  {
    icon: Trophy,
    title: "Проходите опросы",
    description: "После изучения станции пройдите опрос. Не более 2 ошибок! Успешно пройденные станции откроют следующие."
  }
]

export function Onboarding({ isOpen, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const step = steps[currentStep]
  const Icon = step.icon
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    try {
      if (isLastStep) {
        onComplete()
      } else {
        setCurrentStep(prev => prev + 1)
      }
    } catch (e) {
      console.error("[Onboarding] handleNext failed:", e)
      onComplete()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 dark:bg-background/98 backdrop-blur-md">
      <div className="w-full max-w-md">
        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep 
                  ? "w-8 bg-[#E42313]" 
                  : index < currentStep 
                    ? "bg-[#22c55e]" 
                    : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Icon className="w-10 h-10 text-[#E42313]" />
          </div>
          
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
            {step.title}
          </h2>
          
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {step.description}
          </p>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#E42313] px-8 py-2 text-white shadow-lg hover:bg-[#c41f11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E42313] focus-visible:ring-offset-2"
            aria-label={isLastStep ? "Начать исследование" : "Далее"}
          >
            {isLastStep ? "Начать исследование" : "Далее"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Skip button */}
        {!isLastStep && (
          <button
            type="button"
            onClick={onComplete}
            className="mt-6 w-full text-center text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Пропустить обучение
          </button>
        )}
      </div>
    </div>
  )
}
