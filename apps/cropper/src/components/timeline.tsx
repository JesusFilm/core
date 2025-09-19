'use client'

import clsx from 'clsx'
import type { MouseEvent } from 'react'
import type { CropKeyframe } from '../types'
import { formatTime } from '../lib/video-utils'

interface TimelineProps {
  keyframes: CropKeyframe[]
  duration: number
  currentTime: number
  activeKeyframeId?: string | null
  onSeek: (time: number) => void
  onSelectKeyframe: (id: string) => void
}

export function Timeline({
  keyframes,
  duration,
  currentTime,
  activeKeyframeId,
  onSeek,
  onSelectKeyframe
}: TimelineProps) {
  const handleScrub = (event: MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    onSeek(Math.max(0, Math.min(duration, ratio * duration)))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Timeline</span>
        <span>{formatTime(currentTime)}</span>
      </div>
      <div className="relative h-16 rounded-xl border border-slate-800 bg-slate-900/60">
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={handleScrub}
          role="presentation"
          aria-label="Scrub timeline"
        />

        <div
          className="absolute top-0 h-full w-[2px] bg-accent"
          style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        />

        <ul className="absolute inset-0 flex items-center justify-between px-2">
          {keyframes.map((keyframe) => {
            const position = duration > 0 ? (keyframe.time / duration) * 100 : 0
            const isActive = keyframe.id === activeKeyframeId

            return (
              <li key={keyframe.id} className="relative flex h-full w-0 items-end justify-center">
                <button
                  type="button"
                  onClick={() => {
                    onSelectKeyframe(keyframe.id)
                    onSeek(keyframe.time)
                  }}
                  className={clsx(
                    'h-10 w-2 rounded-full transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
                    isActive ? 'bg-accent shadow-floating' : 'bg-slate-600'
                  )}
                  style={{ position: 'absolute', bottom: '4px', left: `${position}%` }}
                  aria-label={`Keyframe at ${formatTime(keyframe.time)}`}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
