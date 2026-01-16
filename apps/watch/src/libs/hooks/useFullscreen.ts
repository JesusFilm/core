import fscreen from 'fscreen'
import { useEffect, useState } from 'react'

/**
 * Custom hook to track fullscreen state globally
 * Uses fscreen library to detect when the document is in fullscreen mode
 */
export function useFullscreen(): boolean {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(fscreen.fullscreenElement != null)
    }

    if (fscreen.fullscreenEnabled) {
      fscreen.addEventListener('fullscreenchange', handleFullscreenChange)
      // Check initial state in case we're already in fullscreen
      setIsFullscreen(fscreen.fullscreenElement != null)
    }

    return () => {
      if (fscreen.fullscreenEnabled) {
        fscreen.removeEventListener('fullscreenchange', handleFullscreenChange)
      }
    }
  }, [])

  return isFullscreen
}