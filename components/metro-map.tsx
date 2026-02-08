"use client"

import React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { stations, getOpeningDates, type Station } from "@/lib/metro-data"
import type { GameState } from "@/lib/game-store"

interface MetroMapProps {
  gameState: GameState
  onStationClick: (station: Station, anchor: { x: number; y: number }) => void
}

export function MetroMap({ gameState, onStationClick }: MetroMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapDivRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hoveredStation, setHoveredStation] = useState<string | null>(null)

  const MAP_WIDTH = 1200
  const MAP_HEIGHT = 1400

  const openingDates = getOpeningDates()
  const availableStations = stations.filter((station) => {
    const stationDateIndex = openingDates.indexOf(station.openedDate)
    return stationDateIndex <= gameState.currentOpeningDateIndex
  })

  const isStationAvailable = useCallback(
    (stationId: string) => availableStations.some((s) => s.id === stationId),
    [availableStations]
  )
  const isStationPassed = useCallback(
    (stationId: string) => gameState.passedStations.includes(stationId),
    [gameState.passedStations]
  )

  const constrainPosition = useCallback(
    (pos: { x: number; y: number }, currentScale: number) => {
      if (!containerRef.current) return pos
      const cw = containerRef.current.clientWidth
      const ch = containerRef.current.clientHeight
      const sw = MAP_WIDTH * currentScale
      const sh = MAP_HEIGHT * currentScale
      const minX = Math.min(0, cw - sw)
      const minY = Math.min(0, ch - sh)
      return {
        x: Math.max(minX, Math.min(0, pos.x)),
        y: Math.max(minY, Math.min(0, pos.y)),
      }
    },
    []
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    if ((e.target as HTMLElement).closest("button[data-marker]")) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      setPosition(
        constrainPosition(
          { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y },
          scale
        )
      )
    },
    [isDragging, dragStart, scale, constrainPosition]
  )
  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: t.clientX - position.x, y: t.clientY - position.y })
    }
  }
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return
      const t = e.touches[0]
      setPosition(
        constrainPosition(
          { x: t.clientX - dragStart.x, y: t.clientY - dragStart.y },
          scale
        )
      )
    },
    [isDragging, dragStart, scale, constrainPosition]
  )
  const handleTouchEnd = useCallback(() => setIsDragging(false), [])

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.5, Math.min(3, scale * delta))
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        setPosition(
          constrainPosition(
            {
              x: position.x - (mx - position.x) * (newScale / scale - 1),
              y: position.y - (my - position.y) * (newScale / scale - 1),
            },
            newScale
          )
        )
      }
      setScale(newScale)
    },
    [scale, position, constrainPosition]
  )

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [handleWheel])

  useEffect(() => {
    if (!containerRef.current) return
    const cw = containerRef.current.clientWidth
    const ch = containerRef.current.clientHeight
    setPosition(
      constrainPosition(
        { x: (cw - MAP_WIDTH) / 2, y: (ch - MAP_HEIGHT) / 2 },
        scale
      )
    )
  }, [])

  const handleStationClick = (station: Station, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isStationAvailable(station.id)) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    onStationClick(station, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    })
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        ref={mapDivRef}
        className="absolute"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
        }}
      >
        <img
          src="/images/metro-map.jpg"
          alt="Карта метро Москвы"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />

        {!gameState.isOnboardingComplete && (
          <div className="absolute inset-0 bg-background/90 dark:bg-background/95 backdrop-blur-sm pointer-events-none" />
        )}

        {stations.map((station) => {
          const available = isStationAvailable(station.id)
          if (!available) return null

          const passed = isStationPassed(station.id)
          const isHovered = hoveredStation === station.id
          const MARKER_Y_OFFSET = 0.25
          const dispX = station.x
          const dispY = station.y + MARKER_Y_OFFSET

          const sizeBase = passed ? 36 : 30
          const sizeHover = passed ? 42 : 36
          const dotBase = passed ? 12 : 10
          const dotHover = passed ? 14 : 12

          return (
            <div
              key={station.id}
              className="absolute pointer-events-none"
              style={{
                left: `${dispX}%`,
                top: `${dispY}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isHovered ? 100 : 10,
              }}
            >
              <button
                data-marker
                type="button"
                className="rounded-full flex items-center justify-center transition-all duration-200 pointer-events-auto bg-transparent"
                style={{
                  width: isHovered ? `${sizeHover}px` : `${sizeBase}px`,
                  height: isHovered ? `${sizeHover}px` : `${sizeBase}px`,
                }}
                onClick={(e) => handleStationClick(station, e)}
                onMouseEnter={() => setHoveredStation(station.id)}
                onMouseLeave={() => setHoveredStation(null)}
                aria-label={station.name}
              >
                <span
                  className={`rounded-full shrink-0 transition-all ${
                    passed
                      ? "ring-2 ring-[#22c55e] ring-offset-2 shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                      : "ring-2 ring-white/60 ring-offset-1 shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                  }`}
                  style={{
                    width: isHovered ? `${dotHover}px` : `${dotBase}px`,
                    height: isHovered ? `${dotHover}px` : `${dotBase}px`,
                    backgroundColor: passed ? "#22c55e" : station.lineColor,
                    boxShadow: passed
                      ? "0 0 12px rgba(34,197,94,0.5)"
                      : "0 2px 6px rgba(0,0,0,0.4)",
                  }}
                />
              </button>
            </div>
          )
        })}

        {hoveredStation && (
          <div
            className="absolute px-3 py-1.5 bg-card border border-border text-foreground text-xs rounded-lg shadow-xl pointer-events-none z-50 whitespace-nowrap backdrop-blur-sm"
            style={{
              left: `${stations.find((s) => s.id === hoveredStation)?.x ?? 0}%`,
              top: `${
                (stations.find((s) => s.id === hoveredStation)?.y ?? 0) +
                0.25 -
                3
              }%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {stations.find((s) => s.id === hoveredStation)?.name}
            {isStationPassed(hoveredStation) && (
              <span className="ml-1 text-[#22c55e]">✓</span>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button
          type="button"
          onClick={() => {
            const ns = Math.min(3, scale * 1.2)
            setScale(ns)
            setPosition(constrainPosition(position, ns))
          }}
          className="w-10 h-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg flex items-center justify-center text-xl font-bold text-foreground hover:bg-card"
          aria-label="Увеличить"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => {
            const ns = Math.max(0.5, scale * 0.8)
            setScale(ns)
            setPosition(constrainPosition(position, ns))
          }}
          className="w-10 h-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-lg flex items-center justify-center text-xl font-bold text-foreground hover:bg-card"
          aria-label="Уменьшить"
        >
          -
        </button>
      </div>
    </div>
  )
}
