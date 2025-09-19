import { clampTime, formatTime, snapToKeyframe } from '../lib/video-utils'
import type { CropKeyframe } from '../types'

describe('video utils', () => {
  it('formats time correctly', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(65)).toBe('1:05')
  })

  it('clamps time within duration', () => {
    expect(clampTime(10, 5)).toBe(5)
    expect(clampTime(-2, 10)).toBe(0)
  })

  it('snaps to nearest keyframe with tolerance', () => {
    const keyframes: CropKeyframe[] = [
      {
        id: 'a',
        time: 2,
        easing: 'linear',
        locked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        window: { focusX: 0.5, focusY: 0.5, scale: 1 }
      },
      {
        id: 'b',
        time: 6,
        easing: 'linear',
        locked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        window: { focusX: 0.5, focusY: 0.5, scale: 1 }
      }
    ]

    expect(snapToKeyframe(2.05, keyframes, 0.2)).toBeCloseTo(2)
    expect(snapToKeyframe(3, keyframes, 0.2)).toBe(3)
  })
})
