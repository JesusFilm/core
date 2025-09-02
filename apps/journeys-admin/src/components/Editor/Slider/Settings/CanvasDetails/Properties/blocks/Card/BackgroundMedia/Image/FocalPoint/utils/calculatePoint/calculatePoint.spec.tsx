import { MouseEvent, RefObject } from 'react'

import { calculatePoint } from './calculatePoint'

describe('calculatePoint', () => {
  const mockBoundingRect = {
    left: 100,
    top: 100,
    width: 200,
    height: 100
  }

  const mockRef: RefObject<HTMLDivElement> = {
    current: {
      getBoundingClientRect: jest.fn(() => mockBoundingRect)
    } as unknown as HTMLDivElement
  }

  it('should calculate correct point when click is inside element', () => {
    const mockEvent = {
      clientX: 200,
      clientY: 150
    } as unknown as MouseEvent

    const result = calculatePoint(mockEvent, mockRef)
    expect(result).toEqual({ x: 50, y: 50 })
  })

  it('should handle click at top-left corner', () => {
    const mockEvent = {
      clientX: 100,
      clientY: 100
    } as unknown as MouseEvent

    const result = calculatePoint(mockEvent, mockRef)
    expect(result).toEqual({ x: 0, y: 0 })
  })

  it('should handle click at bottom-right corner', () => {
    const mockEvent = {
      clientX: 300,
      clientY: 200
    } as unknown as MouseEvent

    const result = calculatePoint(mockEvent, mockRef)
    expect(result).toEqual({ x: 100, y: 100 })
  })

  it('should return null if ref.current is null', () => {
    const nullRef = { current: null }
    const mockEvent = {
      clientX: 200,
      clientY: 150
    } as unknown as MouseEvent

    const result = calculatePoint(mockEvent, nullRef)
    expect(result).toBeNull()
  })
})
