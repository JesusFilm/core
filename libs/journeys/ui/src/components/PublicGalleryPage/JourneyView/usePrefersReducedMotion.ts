import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Reactive `prefers-reduced-motion`. Subscribes to `matchMedia('change')`
 * so animations stop/start mid-session when the user flips the OS setting,
 * rather than honouring whatever the value was at first mount.
 *
 * Initial state is **always `false`** so the server render and the first
 * client render produce identical markup — consulting `matchMedia`
 * synchronously here would otherwise diverge (server: no `matchMedia`
 * → false; reduce-motion client: true), which trips React's hydration
 * mismatch warning on every consumer's transition/willChange styles. The
 * effect below resolves to the real value on the next tick.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState<boolean>(false)

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    )
      return
    const mq = window.matchMedia(QUERY)
    const handler = (event: MediaQueryListEvent): void => {
      setReduce(event.matches)
    }
    mq.addEventListener('change', handler)
    // Sync the post-mount value (it was `false` during the SSR-matching
    // first render so the markup hydrated cleanly).
    setReduce(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduce
}
