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

  it('attaches an IntersectionObserver briefly then disconnects once prefers-reduced-motion lands', () => {
    installMatchMedia(true)
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation(() => ({
        observe,
        disconnect,
        unobserve: vi.fn(),
        takeRecords: vi.fn(() => [])
      }))
    )
    render(
      <ScrollReveal>
        <span data-testid="child">hi</span>
      </ScrollReveal>
    )
    // `usePrefersReducedMotion` initialises to `false` (SSR-safe), then
    // flips to the real `matchMedia` value via its post-mount effect. The
    // observer is therefore attached on the first render (assert `observe`
    // ran) and torn down when the post-mount reduce-motion sync triggers
    // the effect cleanup (assert `disconnect` ran). The child stays in the
    // tree throughout. The dual assertion is what catches a future
    // regression where the observer is left attached under reduce-motion.
    expect(observe).toHaveBeenCalledTimes(1)
    expect(disconnect).toHaveBeenCalledTimes(1)
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
