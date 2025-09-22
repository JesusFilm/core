"use client"

import clsx from "clsx"

export interface ProgressProps {
  value: number // 0-100
  className?: string
  showThumb?: boolean
}

export function Progress({ value, className, showThumb = true }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={clsx("relative h-2 w-full rounded-full bg-stone-700/60", className)}>
      <div
        className="absolute left-0 top-0 h-full rounded-full bg-accent transition-[width] duration-300"
        style={{ width: `${clamped}%` }}
      />
      {showThumb && (
        <div
          className="absolute -top-1.5 h-5 w-5 -translate-x-1/2 rounded-full border border-white/20 bg-white/80 mix-blend-screen"
          style={{ left: `${clamped}%` }}
        />
      )}
    </div>
  )
}

