import { renderHook } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { useNavigationState } from '.'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('useNavigationState', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      events: {
        on: jest.fn(),
        off: jest.fn()
      }
    } as unknown as NextRouter)
    jest.clearAllMocks()
  })

  it('should return false by default', () => {
    const { result } = renderHook(() => useNavigationState())
    expect(result.current).toBe(false)
  })

  it('should set isNavigating to true on routeChangeStart', () => {
    mockUseRouter.mockReturnValue({
      events: {
        on: jest.fn().mockImplementation((event, routeChangeStartCallback) => {
          if (event === 'routeChangeStart') {
            routeChangeStartCallback()
          }
        }),
        off: jest.fn()
      }
    } as unknown as NextRouter)

    const { result } = renderHook(() => useNavigationState())
    expect(result.current).toBe(true)
  })

  it('should set isNavigating to false on routeChangeComplete', () => {
    mockUseRouter.mockReturnValue({
      events: {
        on: jest
          .fn()
          .mockImplementation((event, routeChangeCompleteCallback) => {
            if (event === 'routeChangeComplete') {
              routeChangeCompleteCallback()
            }
          }),
        off: jest.fn()
      }
    } as unknown as NextRouter)

    const { result } = renderHook(() => useNavigationState())
    expect(result.current).toBe(false)
  })

  it('should set isNavigating to false on routeChangeError', () => {
    mockUseRouter.mockReturnValue({
      events: {
        on: jest.fn().mockImplementation((event, routeChangeErrorCallback) => {
          if (event === 'routeChangeError') {
            routeChangeErrorCallback()
          }
        }),
        off: jest.fn()
      }
    } as unknown as NextRouter)

    const { result } = renderHook(() => useNavigationState())
    expect(result.current).toBe(false)
  })

  it('should remove event listeners on unmount', () => {
    const onEvent = jest.fn()
    const offEvent = jest.fn()

    mockUseRouter.mockReturnValue({
      events: {
        on: onEvent,
        off: offEvent
      }
    } as unknown as NextRouter)

    const { unmount } = renderHook(() => useNavigationState())
    unmount()

    expect(onEvent).toHaveBeenCalledTimes(3)
    expect(offEvent).toHaveBeenCalledTimes(3)
  })
})
