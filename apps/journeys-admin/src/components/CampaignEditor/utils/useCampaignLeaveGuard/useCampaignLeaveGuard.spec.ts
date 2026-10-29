import { renderHook } from '@testing-library/react'

import { useCampaignLeaveGuard } from './useCampaignLeaveGuard'

/** Dispatch a `beforeunload` and say whether something asked to stay. */
function leavePrevented(): boolean {
  const event = new Event('beforeunload', { cancelable: true })
  window.dispatchEvent(event)
  return event.defaultPrevented
}

describe('useCampaignLeaveGuard', () => {
  it('asks the browser to confirm leaving while a reason holds', () => {
    renderHook(() => useCampaignLeaveGuard([false, true]))

    expect(leavePrevented()).toBe(true)
  })

  it('lets the page go while no reason holds', () => {
    renderHook(() => useCampaignLeaveGuard([false]))

    expect(leavePrevented()).toBe(false)
  })

  it('stops asking once the reason clears, and when unmounted', () => {
    const { rerender, unmount } = renderHook(
      ({ running }) => useCampaignLeaveGuard([running]),
      { initialProps: { running: true } }
    )
    expect(leavePrevented()).toBe(true)

    rerender({ running: false })
    expect(leavePrevented()).toBe(false)

    rerender({ running: true })
    unmount()
    expect(leavePrevented()).toBe(false)
  })
})
