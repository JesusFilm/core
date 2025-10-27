import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react'

import { Bot } from 'lucide-react'

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    setPrefersReducedMotion(query.matches)

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handleChange)
      return () => {
        query.removeEventListener('change', handleChange)
      }
    }

    query.addListener(handleChange)
    return () => {
      query.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}

type PrayerMessage = {
  title: string
  body?: string
  verse?: string
  reference?: string
  bullets?: string[]
}

export interface PrayerCarouselProps {
  isActive: boolean
  onCollapseComplete?: () => void
}

export function PrayerCarousel({
  isActive,
  onCollapseComplete
}: PrayerCarouselProps) {
  const MESSAGE_DELAY = 2500
  const prefersReducedMotion = usePrefersReducedMotion()
  const carouselId = useId()
  const messagesRegionId = `${carouselId}-messages`
  const messages = useMemo<PrayerMessage[]>(
    () => [
      {
        title: 'What’s Happening Now',
        body:
          'We’re looking at your request.\nGathering Bible verses and conversation ideas\nto help you respond with grace and wisdom.'
      },
      {
        title: 'What Truly Brings Change',
        body: 'No AI can change the human heart.\nOnly the Word of God can.',
        verse:
          '“So is my word that goes out from my mouth:\nIt will not return to me empty,\nbut will accomplish what I desire\nand achieve the purpose for which I sent it.”',
        reference: '— Isaiah 55:11 (NIV)'
      },
      {
        title: 'The Purpose of This Tool',
        bullets: [
          'To inspire you.',
          'To remove fear and hesitation when sharing truth and grace.',
          'To help you see how the Word of God is relevant and applicable to any daily situation.'
        ]
      },
      {
        title: 'The Real Source of Power',
        body:
          'All of this means nothing\nwithout the Holy Spirit and your prayer.\n\nTake a moment to pray.\nAsk God to guide your heart, your words, and this conversation.',
        verse: '“‘Not by might nor by power,\nbut by my Spirit,’ says the Lord Almighty.”',
        reference: '— Zechariah 4:6 (NIV)'
      }
    ],
    []
  )

  const [visibleMessageCount, setVisibleMessageCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const revealTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearRevealTimeouts = useCallback(() => {
    for (const timeoutId of revealTimeoutsRef.current) {
      clearTimeout(timeoutId)
    }
    revealTimeoutsRef.current = []
  }, [])

  useEffect(() => {
    if (isActive) {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current)
        collapseTimeoutRef.current = null
      }
      const frame = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(frame)
    }

    setIsVisible(false)
    setVisibleMessageCount(0)
    clearRevealTimeouts()

    collapseTimeoutRef.current = setTimeout(() => {
      onCollapseComplete?.()
    }, 900)

    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current)
        collapseTimeoutRef.current = null
      }
      clearRevealTimeouts()
    }
  }, [clearRevealTimeouts, isActive, onCollapseComplete])

  useEffect(() => {
    if (!isActive || !isVisible) {
      return
    }

    clearRevealTimeouts()

    if (prefersReducedMotion) {
      setVisibleMessageCount(messages.length)
      return
    }

    setVisibleMessageCount(messages.length > 0 ? 1 : 0)
    messages.slice(1).forEach((_, index) => {
      const timeoutId = setTimeout(() => {
        setVisibleMessageCount((prev) => {
          const nextCount = Math.max(prev, index + 2)
          return nextCount > messages.length ? messages.length : nextCount
        })
      }, MESSAGE_DELAY * (index + 1))

      revealTimeoutsRef.current.push(timeoutId)
    })

    return () => {
      clearRevealTimeouts()
    }
  }, [clearRevealTimeouts, isActive, isVisible, messages, prefersReducedMotion])

  useEffect(() => {
    return () => {
      clearRevealTimeouts()
    }
  }, [clearRevealTimeouts])

  return (
    <div
      className="mt-6 overflow-hidden rounded-3xl transition-all duration-700 ease-out"
      style={{
        maxHeight: isVisible ? 720 : 0,
        opacity: isVisible ? 1 : 0,
        paddingTop: isVisible ? '24px' : '0px',
        paddingBottom: isVisible ? '24px' : '0px'
      }}
    >
      <div className="relative px-6 md:px-10">
        <div
          id={messagesRegionId}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="flex flex-col gap-4"
        >
          {messages.slice(0, visibleMessageCount).map((message) => (
            <div
              key={message.title}
              className="flex items-start gap-3 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-amber-200/60 backdrop-blur"
            >
              <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-700">
                <Bot aria-hidden className="h-4 w-4" />
              </span>
              <div className="flex-1 space-y-3 text-amber-900">
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500/90">
                    During this moment
                  </span>
                  <h3 className="text-lg font-semibold md:text-xl">
                    {message.title}
                  </h3>
                </div>
                {message.body != null && (
                  <p className="text-sm leading-relaxed text-amber-900/80 whitespace-pre-line md:text-base">
                    {message.body}
                  </p>
                )}
                {message.verse != null && (
                  <p className="text-sm italic leading-relaxed text-amber-900/80 whitespace-pre-line md:text-base">
                    {message.verse}
                  </p>
                )}
                {Array.isArray(message.bullets) && message.bullets.length > 0 && (
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-amber-900/80 marker:text-amber-500 md:text-base">
                    {message.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {message.reference != null && (
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-500/70">
                    {message.reference}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
