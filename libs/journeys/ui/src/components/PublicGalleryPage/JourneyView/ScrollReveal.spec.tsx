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
    // No observer created when reduced motion is on — the component shows
    // immediately instead of waiting for an intersection event.
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
