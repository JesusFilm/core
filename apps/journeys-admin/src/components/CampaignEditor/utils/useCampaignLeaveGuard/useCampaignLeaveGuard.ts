import { useEffect } from 'react'

function handleBeforeUnload(event: BeforeUnloadEvent): void {
  event.preventDefault()
}

/**
 * Asks the browser to confirm a reload or a closed tab while any reason to
 * stay holds: one `beforeunload` listener while a reason is true, none
 * otherwise. Client-side navigation is not guarded.
 */
export function useCampaignLeaveGuard(reasons: boolean[]): void {
  const guarding = reasons.some((reason) => reason)

  useEffect(() => {
    if (!guarding) return
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [guarding])
}
