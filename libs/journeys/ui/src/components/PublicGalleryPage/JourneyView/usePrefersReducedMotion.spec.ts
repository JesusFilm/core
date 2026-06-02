import { act, renderHook } from '@testing-library/react'

import { usePrefersReducedMotion } from './usePrefersReducedMotion'

interface MockMediaQueryList {
  matches: boolean
  addEventListener: (
    type: string,
    listener: (event: { matches: boolean }) => void
  ) => void
  removeEventListener: () => void
}

function installMatchMedia(initial: boolean): {
  trigger: (next: boolean) => void
} {
  let listener: ((event: { matches: boolean }) => void) | null = null
  const mq: MockMediaQueryList = {
    matches: initial,
    addEventListener: (_type, handler) => {
      listener = handler
    },
    removeEventListener: vi.fn()
  }
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mq))
  return {
    trigger: (next) => {
      mq.matches = next
      listener?.({ matches: next })
    }
  }
}

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true when matchMedia reports reduced motion at mount', () => {
    installMatchMedia(true)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(true)
  })

  it('returns false when matchMedia reports motion is on at mount', () => {
    installMatchMedia(false)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
  })

  it('reacts to a matchMedia change event mid-session', () => {
    const { trigger } = installMatchMedia(false)
    const { result } = renderHook(() => usePrefersReducedMotion())
    expect(result.current).toBe(false)
    act(() => trigger(true))
    expect(result.current).toBe(true)
    act(() => trigger(false))
    expect(result.current).toBe(false)
  })
})
