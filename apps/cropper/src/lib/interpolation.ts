import type { CropKeyframe } from '../types'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function ease(t: number, easing: CropKeyframe['easing']): number {
  const clamped = clamp(t, 0, 1)

  switch (easing) {
    case 'ease-in':
      return clamped * clamped
    case 'ease-out':
      return 1 - (1 - clamped) * (1 - clamped)
    case 'ease-in-out':
      return clamped < 0.5 ? 2 * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 2) / 2
    case 'linear':
    default:
      return clamped
  }
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t
}

export function interpolateKeyframes(keyframes: CropKeyframe[], time: number): CropKeyframe {
  if (keyframes.length === 0) {
    throw new Error('Cannot interpolate without keyframes')
  }

  if (keyframes.length === 1) {
    return keyframes[0]
  }

  const sorted = [...keyframes].sort((a, b) => a.time - b.time)

  if (time <= sorted[0].time) {
    return sorted[0]
  }

  if (time >= sorted[sorted.length - 1].time) {
    return sorted[sorted.length - 1]
  }

  let previous = sorted[0]
  let next = sorted[sorted.length - 1]

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const current = sorted[index]
    const upcoming = sorted[index + 1]

    if (time >= current.time && time <= upcoming.time) {
      previous = current
      next = upcoming
      break
    }
  }

  const span = Math.max(next.time - previous.time, 0.0001)
  const progress = (time - previous.time) / span
  const eased = ease(progress, next.easing)

  return {
    id: `${previous.id}_${next.id}_interp`,
    time,
    easing: next.easing,
    locked: false,
    createdAt: previous.createdAt,
    updatedAt: next.updatedAt,
    window: {
      focusX: Number(lerp(previous.window.focusX, next.window.focusX, eased).toFixed(4)),
      focusY: Number(lerp(previous.window.focusY, next.window.focusY, eased).toFixed(4)),
      scale: Number(lerp(previous.window.scale, next.window.scale, eased).toFixed(4))
    }
  }
}
