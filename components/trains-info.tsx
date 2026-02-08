"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { metroTrains } from "@/lib/metro-trains"

interface TrainsInfoProps {
  isOpen: boolean
  onClose: () => void
}

export function TrainsInfo({ isOpen, onClose }: TrainsInfoProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 dark:bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            Поезда Московского метрополитена
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <ScrollArea className="flex-1 min-h-0 p-4">
          <div className="space-y-6">
            {metroTrains.map((train) => (
              <div
                key={train.id}
                className="rounded-lg border border-border overflow-hidden bg-muted/30"
              >
                <div className="aspect-video bg-muted relative">
                  {train.photoUrl && !imageErrors[train.id] ? (
                    <img
                      src={train.photoUrl}
                      alt={train.name}
                      className="w-full h-full object-cover"
                      onError={() =>
                        setImageErrors((prev) => ({ ...prev, [train.id]: true }))
                      }
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <span className="text-4xl">🚇</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <h3 className="text-white font-semibold">{train.name}</h3>
                    <p className="text-white/80 text-sm">{train.model}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    {train.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Год выпуска: {train.yearStart} • Линии: {train.lines.join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
