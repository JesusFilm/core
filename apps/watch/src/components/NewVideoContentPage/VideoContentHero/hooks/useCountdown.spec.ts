import { act, renderHook } from '@testing-library/react'

import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('starts from the provided value when running', () => {
    const { result, rerender } = renderHook(
      (props) => useCountdown(props),
      {
        initialProps: {
          isRunning: true,
          initialCount: 5,
          onComplete: jest.fn()
        }
      }
    )

    expect(result.current).toBe(5)

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current).toBe(4)

    rerender({ isRunning: true, initialCount: 3, onComplete: jest.fn() })

    expect(result.current).toBe(3)
  })

  it('calls onComplete when reaching zero', () => {
    const onComplete = jest.fn()
    const { result } = renderHook(() =>
      useCountdown({ isRunning: true, initialCount: 2, onComplete })
    )

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(result.current).toBe(0)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('resets when not running', () => {
    const onComplete = jest.fn()
    const { result, rerender } = renderHook(
      (props) => useCountdown(props),
      {
        initialProps: {
          isRunning: true,
          initialCount: 3,
          onComplete
        }
      }
    )

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    rerender({ isRunning: false, initialCount: 3, onComplete })

    expect(result.current).toBeNull()
  })
})
