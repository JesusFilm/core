import { clampPosition } from './clampPosition'

describe('clampPosition', () => {
  it('should not change values within bounds', () => {
    const result = clampPosition({ x: 50, y: 50 })
    expect(result).toEqual({ x: 50, y: 50 })
  })

  it('should clamp x value to minimum', () => {
    const result = clampPosition({ x: -10, y: 50 })
    expect(result).toEqual({ x: 0, y: 50 })
  })

  it('should clamp x value to maximum', () => {
    const result = clampPosition({ x: 110, y: 50 })
    expect(result).toEqual({ x: 100, y: 50 })
  })

  it('should clamp y value to minimum', () => {
    const result = clampPosition({ x: 50, y: -10 })
    expect(result).toEqual({ x: 50, y: 0 })
  })

  it('should clamp y value to maximum', () => {
    const result = clampPosition({ x: 50, y: 110 })
    expect(result).toEqual({ x: 50, y: 100 })
  })

  it('should round values to two decimal places', () => {
    const result = clampPosition({ x: 50.123, y: 75.678 })
    expect(result).toEqual({ x: 50.12, y: 75.68 })
  })
})
