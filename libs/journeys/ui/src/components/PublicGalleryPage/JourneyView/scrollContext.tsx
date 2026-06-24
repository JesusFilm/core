import {
  ReactElement,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react'

interface ScrollContextValue {
  subscribe: (callback: () => void) => () => void
}

const ScrollContext = createContext<ScrollContextValue | null>(null)

/**
 * Single rAF-throttled `window` scroll + resize listener that broadcasts to
 * every subscriber underneath. Used so several sibling scroll-driven
 * effects (each `useParallax`, the nav's border-fade) share one listener
 * instead of each attaching its own — four independent scroll listeners
 * adds up.
 */
export function ScrollProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const subscribers = useRef(new Set<() => void>())

  useEffect(() => {
    let frame = 0
    const update = (): void => {
      frame = 0
      // Drop a throwing subscriber after its first failure so the console
      // isn't flooded with the same error on every rAF tick. The thrown
      // error is logged once with the subscriber count for context.
      const failing: Array<() => void> = []
      subscribers.current.forEach((callback) => {
        try {
          callback()
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(
            'ScrollProvider subscriber threw, unsubscribing:',
            error
          )
          failing.push(callback)
        }
      })
      failing.forEach((callback) => subscribers.current.delete(callback))
    }
    const onScroll = (): void => {
      if (frame === 0) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    // Prime once so subscribers can settle on the initial scroll position.
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [])

  const value = useMemo<ScrollContextValue>(
    () => ({
      subscribe: (callback) => {
        subscribers.current.add(callback)
        return () => {
          subscribers.current.delete(callback)
        }
      }
    }),
    []
  )

  return (
    <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
  )
}

/**
 * Subscribe a callback to the shared scroll/resize tick. The latest version
 * of the callback is invoked each tick, so consumers don't need to provide
 * a stable reference. Outside a `ScrollProvider` (SSR / jsdom / unwrapped
 * usage) this is a no-op.
 */
export function useScrollSubscription(callback: () => void): void {
  const ctx = useContext(ScrollContext)
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  })
  useEffect(() => {
    if (ctx == null) return
    return ctx.subscribe(() => callbackRef.current())
  }, [ctx])
}
