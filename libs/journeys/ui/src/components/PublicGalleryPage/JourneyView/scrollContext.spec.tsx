import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import { ScrollProvider, useScrollSubscription } from './scrollContext'

function Probe({ onTick }: { onTick: () => void }): ReactElement {
  useScrollSubscription(onTick)
  return <div />
}

describe('scrollContext', () => {
  beforeEach(() => {
    // Synchronous rAF makes scroll-driven assertions trivial: every
    // dispatched scroll runs the broadcast callback immediately.
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 0
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('primes subscribers once on mount and broadcasts on window scroll', () => {
    const tick = vi.fn()
    render(
      <ScrollProvider>
        <Probe onTick={tick} />
      </ScrollProvider>
    )
    expect(tick).toHaveBeenCalledTimes(1) // priming
    window.dispatchEvent(new Event('scroll'))
    expect(tick).toHaveBeenCalledTimes(2)
    window.dispatchEvent(new Event('resize'))
    expect(tick).toHaveBeenCalledTimes(3)
  })

  it('is a no-op outside a provider', () => {
    const tick = vi.fn()
    render(<Probe onTick={tick} />)
    expect(tick).not.toHaveBeenCalled()
    window.dispatchEvent(new Event('scroll'))
    expect(tick).not.toHaveBeenCalled()
  })

  it('isolates subscriber errors so one throwing callback does not skip others', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(vi.fn())
    const failing = vi.fn(() => {
      throw new Error('boom')
    })
    const ok = vi.fn()
    render(
      <ScrollProvider>
        <Probe onTick={failing} />
        <Probe onTick={ok} />
      </ScrollProvider>
    )
    // Priming alone invokes both — the throw must not skip the second.
    expect(failing).toHaveBeenCalledTimes(1)
    expect(ok).toHaveBeenCalledTimes(1)
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
