"use client"

import { useState, useEffect } from "react"
import { playKnifeSound } from "@/lib/sound"

interface SplashScreenProps {
  onComplete: () => void
}

const FADE_IN_MS = 900
const STAY_MS = 1400
const FADE_OUT_MS = 900

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    const tStay = setTimeout(() => {
      playKnifeSound()
      setFadeOut(true)
    }, FADE_IN_MS + STAY_MS)
    return () => clearTimeout(tStay)
  }, [])

  useEffect(() => {
    if (!fadeOut) return
    const t = setTimeout(onComplete, FADE_OUT_MS)
    return () => clearTimeout(t)
  }, [fadeOut, onComplete])

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      style={{
        opacity: fadeOut ? 0 : visible ? 1 : 0,
        transition: `opacity ${fadeOut ? FADE_OUT_MS : FADE_IN_MS}ms ease-in-out`,
      }}
    >
      <p
        className="text-4xl sm:text-5xl font-bold text-foreground tracking-wide"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        🅵🅰🅽🆃🅾🅽🅺🆂
      </p>
      <p className="text-muted-foreground mt-3 text-lg">Метро Москвы</p>
    </div>
  )
}
