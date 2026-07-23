import { renderHook } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import { useRouteChangeState } from '.'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('useRouteChangeState', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      events: {
        on: vi.fn(),
        off: vi.fn()
      }
    } as unknown as NextRouter)
    vi.clearAllMocks()
  })

  it('should return false by default', () => {
    const { result } = renderHook(() => useRouteChangeState())
    expect(result.current).toBe(false)
  })

  it('should set isNavigating to true on routeChangeStart', () => {
    mockUseRouter.mockReturnValue({
      events: {
        on: vi.fn().mockImplementation((event, routeChangeStartCallback) => {
          if (event === 'routeChangeStart') {
            routeChangeStartCallback()
          }
        }),
        off: vi.fn()
      }
    } as unknown as NextRouter)

    const { result } = renderHook(() => useRouteChangeState())
    expect(result.current).toBe(true)
  })

  it('should set isNavigating to false on routeChangeComplete', () => {
    mockUseRouter.mockReturnValue({
      events: {
        on: vi.fn().mockImplementation((event, routeChangeCompleteCallback) => {
          if (event === 'routeChangeComplete') {
            routeChangeCompleteCallback()
          }
        }),
        off: vi.fn()
      }
    } as unknown as NextRouter)

    const { result } = renderHook(() => useRouteChangeState())
    expect(result.current).toBe(false)
  })

  it('should set isNavigating to false on routeChangeError', () => {
    mockUseRouter.mockReturnValue({
      events: {
        on: vi.fn().mockImplementation((event, routeChangeErrorCallback) => {
          if (event === 'routeChangeError') {
            routeChangeErrorCallback()
          }
        }),
        off: vi.fn()
      }
    } as unknown as NextRouter)

    const { result } = renderHook(() => useRouteChangeState())
    expect(result.current).toBe(false)
  })

  it('should remove event listeners on unmount', () => {
    const onEvent = vi.fn()
    const offEvent = vi.fn()

    mockUseRouter.mockReturnValue({
      events: {
        on: onEvent,
        off: offEvent
      }
    } as unknown as NextRouter)

    const { unmount } = renderHook(() => useRouteChangeState())
    unmount()

    expect(onEvent).toHaveBeenCalledTimes(3)
    expect(offEvent).toHaveBeenCalledTimes(3)
  })
})
