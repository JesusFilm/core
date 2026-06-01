import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function getInitial(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(QUERY).matches
  )
}

/**
 * Reactive `prefers-reduced-motion`. Subscribes to `matchMedia('change')`
 * so animations stop/start mid-session when the user flips the OS setting,
 * rather than honouring whatever the value was at first mount.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState<boolean>(getInitial)

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
    // Sync once in case the value changed between getInitial and mount.
    setReduce(mq.matches)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduce
}
