import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react'

import { Book, Target } from 'lucide-react'

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700">
        <img
          src="/robot-book.gif?new"
          alt=""
          className="h-8 w-8 rounded-full"
          aria-hidden
        />
      </span>
      <div className="relative max-w-[min(100%,_38rem)] flex-1 rounded-3xl bg-white/95 p-5 shadow-md ring-1 ring-amber-200/70 backdrop-blur">
        <span
          aria-hidden
          className="absolute -left-2 top-10 block h-3 w-3 origin-bottom-left rotate-45 rounded-sm bg-white/95 ring-1 ring-amber-200/70"
        />
        <div className="flex items-center justify-center py-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  )
}


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
  const MESSAGE_DELAY = 2000 // Show typing indicator 1 second after message appears
  const TYPING_DURATION = 4000 // How long typing indicator shows (3 seconds)
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
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null)
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const revealTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const typingTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearRevealTimeouts = useCallback(() => {
    for (const timeoutId of revealTimeoutsRef.current) {
      clearTimeout(timeoutId)
    }
    revealTimeoutsRef.current = []
  }, [])

  const clearTypingTimeouts = useCallback(() => {
    for (const timeoutId of typingTimeoutsRef.current) {
      clearTimeout(timeoutId)
    }
    typingTimeoutsRef.current = []
    setTypingMessageIndex(null)
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
    clearTypingTimeouts()

    collapseTimeoutRef.current = setTimeout(() => {
      onCollapseComplete?.()
    }, 900)

    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current)
        collapseTimeoutRef.current = null
      }
      clearRevealTimeouts()
      clearTypingTimeouts()
    }
  }, [clearRevealTimeouts, isActive, onCollapseComplete])

  useEffect(() => {
    if (!isActive || !isVisible) {
      return
    }

    clearRevealTimeouts()
    clearTypingTimeouts()

    if (prefersReducedMotion) {
      setVisibleMessageCount(messages.length)
      return
    }

    // Start with first message visible
    setVisibleMessageCount(1)

    // Sequential timing: each message waits for the previous one to complete
    let cumulativeDelay = 0

    messages.slice(1).forEach((_, index) => {
      const messageIndex = index + 1

      // Show typing indicator after the previous message + 1 second delay
      const typingTimeoutId = setTimeout(() => {
        setTypingMessageIndex(messageIndex)
      }, cumulativeDelay + MESSAGE_DELAY)

      // Hide typing and show message after typing duration
      const revealTimeoutId = setTimeout(() => {
        setTypingMessageIndex(null)
        setVisibleMessageCount((prev) => Math.max(prev, messageIndex + 1))
      }, cumulativeDelay + MESSAGE_DELAY + TYPING_DURATION)

      // Update cumulative delay for next message
      cumulativeDelay += MESSAGE_DELAY + TYPING_DURATION

      typingTimeoutsRef.current.push(typingTimeoutId)
      revealTimeoutsRef.current.push(revealTimeoutId)
    })

    return () => {
      clearRevealTimeouts()
      clearTypingTimeouts()
    }
  }, [clearRevealTimeouts, clearTypingTimeouts, isActive, isVisible, messages, prefersReducedMotion, MESSAGE_DELAY, TYPING_DURATION])

  useEffect(() => {
    return () => {
      clearRevealTimeouts()
      clearTypingTimeouts()
    }
  }, [clearRevealTimeouts, clearTypingTimeouts])

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
          className="flex flex-col gap-6"
        >
          {messages.slice(0, visibleMessageCount).map((message) => (
            <div key={message.title} className="flex items-start gap-3">
              <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700">
                {message.title === 'What Truly Brings Change' ? (
                  <Book aria-hidden className="h-4 w-4" />
                ) : message.title === 'The Purpose of This Tool' ? (
                  <Target aria-hidden className="h-4 w-4" />
                ) : (
                  <img
                    src="/robot-book.gif?new"
                    alt=""
                    className="h-8 w-8 rounded-full"
                    aria-hidden
                  />
                )}
              </span>
              <div className="relative max-w-[min(100%,_38rem)] flex-1 rounded-3xl bg-white/95 p-5 shadow-md ring-1 ring-amber-200/70 backdrop-blur">
                <span
                  aria-hidden
                  className="absolute -left-2 top-10 block h-3 w-3 origin-bottom-left rotate-45 rounded-sm bg-white/95 ring-1 ring-amber-200/70"
                />
                <div className="space-y-3 text-amber-900">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500/90">
                      During this moment
                    </span>
                    <h3 className="text-lg font-semibold md:text-xl">
                      {message.title}
                    </h3>
                  </div>
                  {message.body != null && (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-amber-900/85 md:text-base">
                      {message.body}
                    </p>
                  )}
                  {message.verse != null && (
                    <p className="whitespace-pre-line text-sm italic leading-relaxed text-amber-900/80 md:text-base">
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
            </div>
          ))}
          {typingMessageIndex !== null && (
            <TypingIndicator key={`typing-${typingMessageIndex}`} />
          )}
        </div>
      </div>
    </div>
  )
}
