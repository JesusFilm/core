import { useEffect, useRef } from 'react'

/** A reason to stay: a value, or a function read when the page is about to unload. */
export type CampaignLeaveReason = boolean | (() => boolean)

function holds(reason: CampaignLeaveReason): boolean {
  return typeof reason === 'function' ? reason() : reason
}

/**
 * Asks the browser to confirm a reload or a closed tab while any reason to
 * stay holds. A boolean reason registers the one `beforeunload` listener only
 * while it is true; a function reason changes without a render, so while one
 * is passed the listener stays registered and asks only when a reason reads
 * true as the event fires. Client-side navigation is not guarded.
 */
export function useCampaignLeaveGuard(reasons: CampaignLeaveReason[]): void {
  const latest = useRef(reasons)
  latest.current = reasons
  const listening = reasons.some(
    (reason) => typeof reason === 'function' || reason
  )

  useEffect(() => {
    if (!listening) return
    function handleBeforeUnload(event: BeforeUnloadEvent): void {
      if (latest.current.some(holds)) event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [listening])
}
