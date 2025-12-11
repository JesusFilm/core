'use client'

import { ReactElement } from 'react'

interface PlaylistItem {
  id: string
  order: number | null
  videoVariant: {
    id: string
    hls: string | null
    duration: number
    language: {
      id: string
      name: {
        value: string
      }[]
    }
    video: {
      id: string
      title: {
        value: string
      }[]
      images: {
        mobileCinematicHigh: string | null
      }[]
    } | null
  }
}

interface PlaylistListProps {
  items: PlaylistItem[]
  activeIndex: number
  onVideoSelect: (index: number) => void
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function PlaylistList({
  items,
  activeIndex,
  onVideoSelect
}: PlaylistListProps): ReactElement {
  return (
    <div className="space-y-0">
      {items.map((item, index) => {
        const isActive = index === activeIndex
        const title = item.videoVariant.video?.title?.[0]?.value ?? 'Untitled'
        const thumbnail =
          item.videoVariant.video?.images?.[0]?.mobileCinematicHigh ?? null
        const duration = item.videoVariant.duration
        const hasHls = item.videoVariant.hls != null
        const languageName = item.videoVariant.language?.name?.[0]?.value ?? ''

        return (
          <button
            key={item.id}
            onClick={() => onVideoSelect(index)}
            className={`w-full text-left transition-colors ${
              isActive ? 'bg-purple-50' : 'hover:bg-gray-50'
            } ${!hasHls ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            disabled={!hasHls}
            aria-label={`Play ${title}`}
          >
            <div className="flex gap-3 px-4 py-3">
              <div className="flex flex-shrink-0 items-center">
                {isActive && (
                  <svg
                    className="mr-2 h-4 w-4 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
                {!isActive && <div className="mr-2 w-4" />}
              </div>
              {thumbnail ? (
                <div className="relative h-14 w-24 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                  <img
                    src={thumbnail}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-1 bottom-1 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
                    {formatDuration(duration)}
                  </div>
                </div>
              ) : (
                <div className="relative flex h-14 w-24 flex-shrink-0 items-center justify-center rounded bg-gray-200">
                  <div className="text-xs text-gray-400">No thumbnail</div>
                  <div className="absolute right-1 bottom-1 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
                    {formatDuration(duration)}
                  </div>
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <div
                  className={`mb-0.5 line-clamp-2 text-sm font-medium ${
                    isActive ? 'text-gray-900' : 'text-gray-900'
                  }`}
                >
                  {title}
                </div>
                {languageName && (
                  <div className="text-xs text-gray-600">{languageName}</div>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
