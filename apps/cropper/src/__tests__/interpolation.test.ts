import { interpolateKeyframes } from '../lib/interpolation'
import type { CropKeyframe } from '../types'

const createKeyframe = (overrides: Partial<CropKeyframe>): CropKeyframe => ({
  id: overrides.id ?? 'kf',
  time: overrides.time ?? 0,
  easing: overrides.easing ?? 'linear',
  locked: overrides.locked ?? false,
  createdAt: overrides.createdAt ?? new Date().toISOString(),
  updatedAt: overrides.updatedAt ?? new Date().toISOString(),
  window: overrides.window ?? { focusX: 0.5, focusY: 0.5, scale: 1 }
})

describe('interpolation', () => {
  it('returns edge keyframes when time is outside range', () => {
    const start = createKeyframe({ id: 'start', time: 0 })
    const end = createKeyframe({ id: 'end', time: 10 })

    expect(interpolateKeyframes([start, end], -1).id).toBe('start')
    expect(interpolateKeyframes([start, end], 11).id).toBe('end')
  })

  it('linearly interpolates focus and scale', () => {
    const start = createKeyframe({
      id: 'start',
      time: 0,
      window: { focusX: 0.2, focusY: 0.3, scale: 1 }
    })
    const end = createKeyframe({
      id: 'end',
      time: 4,
      window: { focusX: 0.8, focusY: 0.7, scale: 0.6 }
    })

    const result = interpolateKeyframes([start, end], 2)

    expect(result.window.focusX).toBeCloseTo(0.5)
    expect(result.window.focusY).toBeCloseTo(0.5)
    expect(result.window.scale).toBeCloseTo(0.8)
  })

  it('applies easing curves', () => {
    const start = createKeyframe({
      id: 'start',
      time: 0,
      window: { focusX: 0, focusY: 0, scale: 0.5 }
    })
    const end = createKeyframe({
      id: 'end',
      time: 4,
      easing: 'ease-in',
      window: { focusX: 1, focusY: 1, scale: 1 }
    })

    const linear = interpolateKeyframes([start, { ...end, easing: 'linear' }], 2).window.focusX
    const eased = interpolateKeyframes([start, end], 2).window.focusX

    expect(eased).toBeLessThan(linear)
  })
})
