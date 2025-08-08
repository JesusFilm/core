'use client'

import { Clock } from 'lucide-react'
import type { KeyboardEvent, ReactElement } from 'react'

type VideoGridItem = {
  id: string
  title: string
  durationSeconds: number
}

export interface VideoGridSectionProps {
  isLoading?: boolean
  showNumbering?: boolean
}

const hardcodedItems: VideoGridItem[] = Array.from({ length: 10 }).map((_, index) => ({
  id: `item-${index + 1}`,
  title: `Video ${index + 1}: Journey of Faith`,
  durationSeconds: 8 * 60 + 30
}))

function formatDurationShort(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const paddedSeconds = seconds.toString().padStart(2, '0')
  return `${minutes}:${paddedSeconds}`
}

export function VideoGridSection(props: VideoGridSectionProps): ReactElement {
  const { isLoading = false, showNumbering = false } = props

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }
    event.preventDefault()
    // No navigation in Basic slice; reserved for future improvements
  }

  const sectionTitle = 'FEATURED VIDEOS'
  const headingText = 'Explore the Video Library'

  return (
    <section className="min-h-[60vh] bg-slate-950 py-16 text-white relative">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-8 relative z-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-stone-200/80 text-sm tracking-[0.3em] uppercase mb-4">{sectionTitle}</p>
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold leading-tight text-white">
              {headingText}
            </h2>
          </div>
          <button
            type="button"
            aria-label="see all videos"
            className="justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 rounded-full font-semibold tracking-wide transition-all duration-200 bg-white/10 hover:bg-white/20 border border-white/20 text-white hidden sm:inline-flex"
          >
            SEE ALL
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse">
                  <div className="h-5 w-16 bg-white/20 rounded mb-3" data-testid="item-loading-skeleton" />
                  <div className="h-6 w-3/4 bg-white/20 rounded mb-2" data-testid="item-loading-skeleton" />
                  <div className="h-4 w-1/3 bg-white/20 rounded" data-testid="item-loading-skeleton" />
                </div>
              ))
            : hardcodedItems.map((item, index) => {
                const numbering = showNumbering ? `Item ${index + 1}` : ''
                const aria = numbering ? `${numbering}: ${item.title}` : item.title
                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-label={aria}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
                    onKeyDown={handleKeyDown}
                  >
                    {showNumbering ? (
                      <div className="text-xs uppercase tracking-widest text-stone-300/80 mb-2">{numbering}</div>
                    ) : null}
                    <h3 className="text-white text-lg font-semibold leading-snug mb-1">{item.title}</h3>
                    <div className="flex items-center gap-2 text-stone-300/80 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDurationShort(item.durationSeconds)}</span>
                    </div>
                  </div>
                )
              })}
        </div>

        <div className="mt-6 sm:hidden">
          <button
            type="button"
            aria-label="see all videos"
            className="w-full justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 rounded-full font-semibold tracking-wide transition-all duration-200 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          >
            SEE ALL
          </button>
        </div>
      </div>
    </section>
  )
}

