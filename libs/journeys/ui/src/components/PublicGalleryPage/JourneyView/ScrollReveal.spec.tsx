import { render, screen } from '@testing-library/react'

import { ScrollReveal } from './ScrollReveal'

interface MockMediaQueryList {
  matches: boolean
  addEventListener: () => void
  removeEventListener: () => void
}

function installMatchMedia(initial: boolean): void {
  const mq: MockMediaQueryList = {
    matches: initial,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mq))
}

describe('ScrollReveal', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not attach an IntersectionObserver when prefers-reduced-motion is on', () => {
    installMatchMedia(true)
    const observe = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation(() => ({
        observe,
        disconnect: vi.fn(),
        unobserve: vi.fn(),
        takeRecords: vi.fn(() => [])
      }))
    )
    render(
      <ScrollReveal>
        <span data-testid="child">hi</span>
      </ScrollReveal>
    )
    // MUI's `useMediaQuery` returns the synchronous client value on the
    // first client render (via `useSyncExternalStore`), so a reduce-motion
    // client sees `reduceMotion=true` immediately and the effect short-
    // circuits without ever attaching an observer. SSR stays at the
    // `defaultMatches: false` value so hydration markup matches.
    expect(observe).not.toHaveBeenCalled()
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('attaches an IntersectionObserver when reduced motion is off', () => {
    installMatchMedia(false)
    const observe = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation(() => ({
        observe,
        disconnect: vi.fn(),
        unobserve: vi.fn(),
        takeRecords: vi.fn(() => [])
      }))
    )
    render(
      <ScrollReveal>
        <span>hi</span>
      </ScrollReveal>
    )
    expect(observe).toHaveBeenCalled()
  })
})
