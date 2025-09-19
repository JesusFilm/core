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
