'use client'

import { useEffect, useState } from 'react'

interface SceneChangeIndicatorProps {
  show: boolean
  onHide?: () => void
}

export function SceneChangeIndicator({ show, onHide }: SceneChangeIndicatorProps) {
  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (show) {
      console.log(`🎬 [5/5] SceneChangeIndicator showing "New Scene" chip (edge detection)`)
      setVisible(true)
      setAnimating(true)

      // Start fade out animation after 1.5 seconds
      const fadeOutTimer = setTimeout(() => {
        setAnimating(false)
      }, 1500)

      // Hide completely after 2 seconds
      const hideTimer = setTimeout(() => {
        setVisible(false)
        onHide?.()
      }, 2000)

      return () => {
        clearTimeout(fadeOutTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [show, onHide])

  if (!visible) return null

  return (
    <div
      className={`absolute top-4 left-4 z-50 transition-all duration-300 ease-out ${
        animating
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 -translate-y-2'
      }`}
    >
      <div className="bg-orange-500/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-orange-400/50">
        <span className="text-white text-sm font-medium tracking-wide">
          New Scene
        </span>
      </div>
    </div>
  )
}
