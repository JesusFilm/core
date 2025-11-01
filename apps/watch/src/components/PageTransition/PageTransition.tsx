import { useRouter } from 'next/router'
import {
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState
} from 'react'

import { cn } from '../../libs/cn/cn'

const EXIT_DURATION = 360
const ENTER_DURATION = 420

interface PageTransitionProps {
  children: ReactNode
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia == null) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (event: MediaQueryListEvent): void => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', listener)

    return () => {
      mediaQuery.removeEventListener('change', listener)
    }
  }, [])

  return prefersReducedMotion
}

export function PageTransition({ children }: PageTransitionProps): ReactElement {
  const router = useRouter()
  const reduceMotion = usePrefersReducedMotion()
  const [displayedContent, setDisplayedContent] = useState<ReactNode>(children)
  const displayedRef = useRef<ReactNode>(children)
  const displayedKeyRef = useRef<string>(router.asPath)
  const [incomingContent, setIncomingContent] = useState<ReactNode | null>(null)
  const [outgoingContent, setOutgoingContent] = useState<ReactNode | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const firstRenderRef = useRef(true)
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const enterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current != null) clearTimeout(exitTimeoutRef.current)
      if (enterTimeoutRef.current != null) clearTimeout(enterTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    displayedRef.current = displayedContent
  }, [displayedContent])

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      setDisplayedContent(children)
      displayedKeyRef.current = router.asPath
      return
    }

    if (reduceMotion) {
      setDisplayedContent(children)
      displayedKeyRef.current = router.asPath
      setOutgoingContent(null)
      setIncomingContent(null)
      setIsTransitioning(false)
      return
    }

    setOutgoingContent(displayedRef.current)
    setIncomingContent(children)
    setIsTransitioning(true)

    if (exitTimeoutRef.current != null) clearTimeout(exitTimeoutRef.current)
    if (enterTimeoutRef.current != null) clearTimeout(enterTimeoutRef.current)

    exitTimeoutRef.current = setTimeout(() => {
      setDisplayedContent(children)
      displayedKeyRef.current = router.asPath
      setOutgoingContent(null)
    }, EXIT_DURATION)

    enterTimeoutRef.current = setTimeout(() => {
      setIncomingContent(null)
      setIsTransitioning(false)
    }, EXIT_DURATION + ENTER_DURATION)
  }, [children, reduceMotion, router.asPath])

  const activeContent = incomingContent ?? displayedContent
  const currentKey = reduceMotion ? router.asPath : displayedKeyRef.current

  return (
    <div
      className={cn(
        'page-transition',
        isTransitioning ? 'page-transition--animating' : undefined
      )}
    >
      {isTransitioning && outgoingContent != null && (
        <div className="page-transition__layer page-transition__layer--exit">
          {outgoingContent}
        </div>
      )}
      <div
        key={currentKey}
        className={cn(
          'page-transition__layer',
          isTransitioning && incomingContent != null
            ? 'page-transition__layer--enter'
            : 'page-transition__layer--rest'
        )}
      >
        {activeContent}
      </div>
      <div className="page-transition__sheen" aria-hidden />
    </div>
  )
}
