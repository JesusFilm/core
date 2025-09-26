'use client'

import { useState, useEffect } from 'react'
import { formatTime, captureVideoThumbnail } from '../lib/video-utils'

interface DetectionLogEntryProps {
  timestamp: number
  label: string
  value: string
  videoElement?: HTMLVideoElement | null
}

export function DetectionLogEntry({ timestamp, label, value, videoElement }: DetectionLogEntryProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!videoElement) return

    setIsLoading(true)
    captureVideoThumbnail(videoElement, timestamp, 80, 45)
      .then((thumb) => {
        setThumbnail(thumb)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [videoElement, timestamp])

  return (
    <div className="flex items-center gap-3 text-sm font-mono">
      <div className="flex-shrink-0 w-20 h-[45px] bg-stone-800 rounded overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : thumbnail ? (
          <img
            src={thumbnail}
            alt={`Video frame at ${formatTime(timestamp)}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs">
            No img
          </div>
        )}
      </div>

      <div className="flex-1">
        <span className="text-stone-300">
          {formatTime(timestamp)} {label} {value}
        </span>
      </div>
    </div>
  )
}
