import clsx from 'clsx'
import {
  type CSSProperties,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

const TRANSITION_DURATION = 360

type TransitionPhase = 'idle' | 'enter' | 'exit'

export interface PageTransitionProps {
  routeKey: string
  duration?: number
  className?: string
}

export function PageTransition({
  routeKey,
  duration = TRANSITION_DURATION,
  className,
  children
}: PropsWithChildren<PageTransitionProps>): JSX.Element {
  const [rendered, setRendered] = useState({ key: routeKey, node: children })
  const [phase, setPhase] = useState<TransitionPhase>('enter')
  const exitTimeoutRef = useRef<NodeJS.Timeout>()
  const settleTimeoutRef = useRef<NodeJS.Timeout>()

  const style = useMemo(
    () =>
      ({
        '--watch-page-transition-duration': `${duration}ms`
      }) as CSSProperties,
    [duration]
  )

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current != null) clearTimeout(exitTimeoutRef.current)
      if (settleTimeoutRef.current != null) clearTimeout(settleTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (routeKey === rendered.key) {
      setRendered({ key: routeKey, node: children })
      return
    }

    if (exitTimeoutRef.current != null) clearTimeout(exitTimeoutRef.current)
    if (settleTimeoutRef.current != null) clearTimeout(settleTimeoutRef.current)

    setPhase('exit')

    const next = { key: routeKey, node: children }
    exitTimeoutRef.current = setTimeout(() => {
      setRendered(next)
      setPhase('enter')
    }, duration)

    return () => {
      if (exitTimeoutRef.current != null) clearTimeout(exitTimeoutRef.current)
    }
  }, [children, duration, rendered.key, routeKey])

  useEffect(() => {
    if (phase !== 'enter') return

    if (settleTimeoutRef.current != null) clearTimeout(settleTimeoutRef.current)
    settleTimeoutRef.current = setTimeout(() => {
      setPhase('idle')
    }, duration)

    return () => {
      if (settleTimeoutRef.current != null) clearTimeout(settleTimeoutRef.current)
    }
  }, [duration, phase])

  return (
    <div
      data-testid="page-transition"
      className={clsx(
        'watch-page-transition',
        className,
        phase === 'enter' && 'watch-page-transition--enter',
        phase === 'exit' && 'watch-page-transition--exit'
      )}
      style={style}
    >
      {rendered.node}
    </div>
  )
}
