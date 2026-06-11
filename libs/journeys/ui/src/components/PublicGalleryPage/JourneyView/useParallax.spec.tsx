import { render, screen } from '@testing-library/react'
import { ReactElement } from 'react'

import { ScrollProvider } from './scrollContext'
import { useParallax } from './useParallax'

function ParallaxProbe(): ReactElement {
  const ref = useParallax(0.1, 0.1)
  return <div data-testid="probe" ref={ref} />
}

interface MockMediaQueryList {
  matches: boolean
  addEventListener: (
    type: string,
    listener: (event: { matches: boolean }) => void
  ) => void
  removeEventListener: () => void
}

function installMatchMedia(initial: boolean): { mq: MockMediaQueryList } {
  const mq: MockMediaQueryList = {
    matches: initial,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mq))
  return { mq }
}

function setViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    writable: true,
    configurable: true
  })
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    writable: true,
    configurable: true
  })
}

describe('useParallax', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 0
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('writes a translateY transform on scroll when the element overlaps the viewport', () => {
    installMatchMedia(false)
    setViewport(1200, 800)
    render(
      <ScrollProvider>
        <ParallaxProbe />
      </ScrollProvider>
    )
    const probe = screen.getByTestId('probe')
    // Place the element mostly above the viewport centre so progress is < 0.
    vi.spyOn(probe, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 500,
      left: 0,
      right: 400,
      height: 400,
      width: 400,
      x: 0,
      y: 100,
      toJSON: () => ({})
    } as DOMRect)
    window.dispatchEvent(new Event('scroll'))
    expect(probe.style.transform).toMatch(/^translateY\(-?\d+(\.\d+)?px\)$/)
  })

  it('does not write a transform when prefers-reduced-motion is on', () => {
    installMatchMedia(true)
    setViewport(1200, 800)
    render(
      <ScrollProvider>
        <ParallaxProbe />
      </ScrollProvider>
    )
    const probe = screen.getByTestId('probe')
    vi.spyOn(probe, 'getBoundingClientRect').mockReturnValue({
      top: 100,
      bottom: 500,
      left: 0,
      right: 400,
      height: 400,
      width: 400,
      x: 0,
      y: 100,
      toJSON: () => ({})
    } as DOMRect)
    window.dispatchEvent(new Event('scroll'))
    expect(probe.style.transform).toBe('')
  })

  it('skips writing a transform when the element is well off-screen', () => {
    installMatchMedia(false)
    setViewport(1200, 800)
    render(
      <ScrollProvider>
        <ParallaxProbe />
      </ScrollProvider>
    )
    const probe = screen.getByTestId('probe')
    // The ScrollProvider primes once on mount, so we plant a sentinel after
    // mount and assert the off-screen scroll leaves it untouched.
    probe.style.transform = 'translateY(999px)'
    // Well below the viewport (top > 2 * innerHeight).
    vi.spyOn(probe, 'getBoundingClientRect').mockReturnValue({
      top: 2000,
      bottom: 2400,
      left: 0,
      right: 400,
      height: 400,
      width: 400,
      x: 0,
      y: 2000,
      toJSON: () => ({})
    } as DOMRect)
    window.dispatchEvent(new Event('scroll'))
    expect(probe.style.transform).toBe('translateY(999px)')
  })
})
