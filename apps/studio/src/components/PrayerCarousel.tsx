import { useEffect, useMemo, useRef, useState } from 'react'

type PrayerSlide = {
  title: string
  body?: string
  reference?: string
  bullets?: string[]
}

export interface PrayerCarouselProps {
  isActive: boolean
  onCollapseComplete?: () => void
}

const SLIDE_INTERVAL = 6000

export function PrayerCarousel({
  isActive,
  onCollapseComplete
}: PrayerCarouselProps) {
  const slides = useMemo<PrayerSlide[]>(
    () => [
      {
        title: 'God Gives the Growth',
        body:
          '“I planted, Apollos watered, but God gave the growth. So neither the one who plants nor the one who waters is anything, but only God who gives the growth.”',
        reference: '1 Corinthians 3:6-7'
      },
      {
        title: 'Pause to Pray',
        body:
          'Before we craft another sentence, breathe. No arrangement of words, design, or effort can wake a heart—only the Spirit of God can.'
      },
      {
        title: 'What to Pray About',
        bullets: [
          'That Jesus would be seen clearly and beautifully by everyone who encounters this message.',
          'That God would draw the right people to engage and respond.',
          'That we would listen and obey whatever He asks us to do next.'
        ]
      },
      {
        title: 'Faith Like a Mustard Seed',
        body:
          '“The kingdom of heaven is like a grain of mustard seed... it is the smallest of all seeds, but when it has grown it is larger than all garden plants.”',
        reference: 'Matthew 13:31-32'
      },
      {
        title: 'Prepare the Soil',
        body:
          '“As for that in the good soil, they are those who, hearing the word, hold it fast in an honest and good heart, and bear fruit with patience.”',
        reference: 'Luke 8:15'
      },
      {
        title: 'Sent to the World',
        body:
          '“Go into all the world and proclaim the gospel to the whole creation.”',
        reference: 'Mark 16:15'
      }
    ],
    []
  )

  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [progress, setProgress] = useState(0)
  const [isProgressAnimating, setIsProgressAnimating] = useState(false)
  const progressFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (isActive) {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current)
        collapseTimeoutRef.current = null
      }
      setCurrentSlide(0)
      const frame = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(frame)
    }

    setIsVisible(false)

    collapseTimeoutRef.current = setTimeout(() => {
      onCollapseComplete?.()
    }, 900)

    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current)
        collapseTimeoutRef.current = null
      }
    }
  }, [isActive, onCollapseComplete])

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, SLIDE_INTERVAL)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, slides.length])

  useEffect(() => {
    if (!isActive || !isVisible) {
      if (progressFrameRef.current != null) {
        cancelAnimationFrame(progressFrameRef.current)
        progressFrameRef.current = null
      }
      setIsProgressAnimating(false)
      setProgress(0)
      return
    }

    if (progressFrameRef.current != null) {
      cancelAnimationFrame(progressFrameRef.current)
    }

    setIsProgressAnimating(false)
    setProgress(0)

    progressFrameRef.current = requestAnimationFrame(() => {
      setIsProgressAnimating(true)
      setProgress(100)
      progressFrameRef.current = null
    })

    return () => {
      if (progressFrameRef.current != null) {
        cancelAnimationFrame(progressFrameRef.current)
        progressFrameRef.current = null
      }
    }
  }, [currentSlide, isActive, isVisible])

  return (
    <div
      className="mt-6 overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-rose-50 shadow-lg transition-all duration-700 ease-out"
      style={{
        maxHeight: isVisible ? 360 : 0,
        opacity: isVisible ? 1 : 0,
        paddingTop: isVisible ? '24px' : '0px',
        paddingBottom: isVisible ? '24px' : '0px'
      }}
    >
      <div className="px-6 md:px-10">
        <div className="relative min-h-[180px]">
          {slides.map((slide, index) => {
            const isCurrent = index === currentSlide
            return (
              <div
                key={slide.title}
                className="absolute inset-0 flex flex-col justify-center gap-4"
                style={{
                  opacity: isCurrent && isVisible ? 1 : 0,
                  transform: isCurrent && isVisible ? 'translateY(0px)' : 'translateY(16px)',
                  transition: 'opacity 600ms ease, transform 600ms ease'
                }}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500/90">
                  During this moment
                </span>
                <h3 className="text-xl font-semibold text-amber-900 md:text-2xl">
                  {slide.title}
                </h3>
                {slide.body != null && (
                  <p className="text-sm leading-relaxed text-amber-900/80 md:text-base">
                    {slide.body}
                  </p>
                )}
                {Array.isArray(slide.bullets) && slide.bullets.length > 0 && (
                  <ul className="space-y-2 text-sm leading-relaxed text-amber-900/80 md:text-base">
                    {slide.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {slide.reference != null && (
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-500/70">
                    {slide.reference}
                  </p>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-8 flex items-center justify-center gap-3">
          {slides.map((_, index) => {
            const isCurrent = index === currentSlide && isVisible
            const isLast = index === slides.length - 1

            return (
              <div key={index} className="flex items-center gap-3">
                <span
                  className="h-2 w-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: isCurrent ? 'rgb(217 119 6)' : 'rgba(245, 158, 11, 0.35)',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(217, 119, 6, 0.15)' : undefined
                  }}
                />
                {!isLast && (
                  <div
                    className="relative h-1.5 w-16 overflow-hidden rounded-full"
                    style={{
                      backgroundColor: isCurrent
                        ? 'rgba(217, 119, 6, 0.25)'
                        : 'rgba(245, 158, 11, 0.18)'
                    }}
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-amber-500"
                      style={{
                        width: isCurrent ? `${progress}%` : '0%',
                        transition: isCurrent && isProgressAnimating ? `width ${SLIDE_INTERVAL}ms linear` : 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
