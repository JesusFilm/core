import type { CropKeyframe, Video } from '../types'

export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds)) {
    return '0:00'
  }

  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder.toString().padStart(2, '0')}`
}

export function aspectRatio(video: Video): number {
  return video.width / video.height
}

export function captureVideoThumbnail(videoElement: HTMLVideoElement, time: number, width: number = 80, height: number = 45): Promise<string | null> {
  return new Promise((resolve) => {
    if (!videoElement) {
      resolve(null)
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      resolve(null)
      return
    }

    canvas.width = width
    canvas.height = height

    // Store original time
    const originalTime = videoElement.currentTime

    // Seek to the desired time
    videoElement.currentTime = time

    const onSeeked = () => {
      videoElement.removeEventListener('seeked', onSeeked)

      try {
        // Draw the frame to canvas
        ctx.drawImage(videoElement, 0, 0, width, height)

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(dataUrl)
      } catch (error) {
        console.error('Failed to capture video thumbnail:', error)
        resolve(null)
      } finally {
        // Restore original time
        videoElement.currentTime = originalTime
      }
    }

    videoElement.addEventListener('seeked', onSeeked)

    // Timeout fallback (in case seeked doesn't fire)
    setTimeout(() => {
      videoElement.removeEventListener('seeked', onSeeked)
      resolve(null)
    }, 2000)
  })
}

export function clampTime(time: number, duration: number): number {
  if (!Number.isFinite(time)) {
    return 0
  }

  return Math.min(Math.max(time, 0), Math.max(duration, 0))
}

export function snapToKeyframe(time: number, keyframes: CropKeyframe[], tolerance = 0.2): number {
  const nearest = keyframes.reduce<null | CropKeyframe>((closest, current) => {
    if (!closest) return current
    const deltaCurrent = Math.abs(current.time - time)
    const deltaClosest = Math.abs(closest.time - time)
    return deltaCurrent < deltaClosest ? current : closest
  }, null)

  if (!nearest) {
    return time
  }

  return Math.abs(nearest.time - time) <= tolerance ? nearest.time : time
}

export function fractionToPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function computeKeyframeIndex(keyframes: CropKeyframe[], activeId?: string): number {
  if (!activeId) {
    return -1
  }

  return keyframes.findIndex((frame) => frame.id === activeId)
}
