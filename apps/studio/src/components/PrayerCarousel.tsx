import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import type { CarouselApi } from '@/components/ui/carousel'

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

export function PrayerCarousel({
  isActive,
  onCollapseComplete
}: PrayerCarouselProps) {
  const SLIDE_DURATION = 8000
  const prefersReducedMotion = usePrefersReducedMotion()
  const carouselId = useId()
  const slidesRegionId = `${carouselId}-slides`
  const indicatorRegionId = `${carouselId}-indicators`
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

  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [progress, setProgress] = useState(0)
  const [isProgressAnimating, setIsProgressAnimating] = useState(false)
  const progressFrameRef = useRef<number | null>(null)
  const autoAdvanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current)
      autoAdvanceTimeoutRef.current = null
    }
  }, [])

  const handlePrevious = useCallback(() => {
    clearAutoAdvance()
    if (carouselApi != null) {
      carouselApi.scrollPrev()
      return
    }
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [carouselApi, clearAutoAdvance, slides.length])

  const handleNext = useCallback(() => {
    clearAutoAdvance()
    if (carouselApi != null) {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext()
      } else {
        carouselApi.scrollTo(0)
      }
      return
    }
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [carouselApi, clearAutoAdvance, slides.length])

  useEffect(() => {
    if (isActive) {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current)
        collapseTimeoutRef.current = null
      }
      setCurrentSlide(0)
      if (carouselApi != null) {
        carouselApi.scrollTo(0)
      }
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
  }, [carouselApi, isActive, onCollapseComplete])

  useEffect(() => {
    if (!isActive || !isVisible) {
      if (progressFrameRef.current != null) {
        cancelAnimationFrame(progressFrameRef.current)
        progressFrameRef.current = null
      }
      clearAutoAdvance()
      setIsProgressAnimating(false)
      setProgress(0)
      return
    }

    if (progressFrameRef.current != null) {
      cancelAnimationFrame(progressFrameRef.current)
      progressFrameRef.current = null
    }

    setIsProgressAnimating(false)
    setProgress(prefersReducedMotion ? 100 : 0)

    if (!prefersReducedMotion) {
      progressFrameRef.current = requestAnimationFrame(() => {
        setIsProgressAnimating(true)
        setProgress(100)
        progressFrameRef.current = null
      })
    }

    clearAutoAdvance()
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      autoAdvanceTimeoutRef.current = null
      if (carouselApi != null) {
        if (carouselApi.canScrollNext()) {
          carouselApi.scrollNext()
        } else {
          carouselApi.scrollTo(0)
        }
      } else {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }
    }, SLIDE_DURATION)

    return () => {
      if (progressFrameRef.current != null) {
        cancelAnimationFrame(progressFrameRef.current)
        progressFrameRef.current = null
      }
      clearAutoAdvance()
    }
  }, [
    carouselApi,
    currentSlide,
    isActive,
    isVisible,
    prefersReducedMotion,
    slides.length,
    SLIDE_DURATION,
    clearAutoAdvance
  ])

  useEffect(() => {
    if (!isActive || !isVisible) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handlePrevious()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleNext, handlePrevious, isActive, isVisible])

  useEffect(() => {
    if (carouselApi == null) {
      return
    }

    const handleSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap())
    }

    handleSelect()
    carouselApi.on('select', handleSelect)
    carouselApi.on('reInit', handleSelect)

    return () => {
      carouselApi.off('select', handleSelect)
      carouselApi.off('reInit', handleSelect)
    }
  }, [carouselApi])

  return (
    <div
      className="mt-6 overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-rose-50 transition-all duration-700 ease-out"
      style={{
        maxHeight: isVisible ? 360 : 0,
        opacity: isVisible ? 1 : 0,
        paddingTop: isVisible ? '24px' : '0px',
        paddingBottom: isVisible ? '24px' : '0px'
      }}
    >
      <div className="px-6 md:px-10">
        <Carousel
          className="relative"
          opts={{ loop: true }}
          setApi={(api) => {
            setCarouselApi(api)
          }}
          aria-label="Prayer focus carousel"
        >
          <CarouselContent
            id={slidesRegionId}
            role="group"
            aria-live="polite"
            aria-atomic="true"
            className="min-h-[180px]"
          >
            {slides.map((slide, index) => {
              const isCurrent = index === currentSlide
              return (
                <CarouselItem key={slide.title} className="!pl-0">
                  <div
                    className="flex h-full flex-col justify-center gap-4"
                    style={{
                      opacity: isCurrent && isVisible ? 1 : 0,
                      transform: isCurrent && isVisible ? 'translateY(0px)' : 'translateY(16px)',
                      transition: 'opacity 600ms ease, transform 600ms ease'
                    }}
                    aria-hidden={!isCurrent || !isVisible}
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
                      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-amber-900/80 marker:text-amber-500 md:text-base">
                        {slide.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {slide.reference != null && (
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-500/70">
                        {slide.reference}
                      </p>
                    )}
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
        <div
          className="mt-8 flex items-center justify-center gap-4"
          id={indicatorRegionId}
          role="group"
          aria-label="Prayer focus slides"
        >
          {slides.length > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/80 bg-white/80 text-amber-600 transition hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              aria-label="Previous slide"
              aria-controls={slidesRegionId}
            >
              ‹
            </button>
          )}
          <div className="flex items-center gap-4" aria-hidden>
            {slides.map((_, index) => {
              const isCurrent = index === currentSlide && isVisible

              if (isCurrent) {
                return (
                  <div
                    key={index}
                    className="relative h-1.5 w-16 overflow-hidden rounded-full bg-amber-500/20"
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-amber-500"
                      style={{
                        width: `${progress}%`,
                        transition:
                          isProgressAnimating && !prefersReducedMotion
                          ? `width ${SLIDE_DURATION}ms linear`
                          : 'none'
                      }}
                      aria-hidden
                    />
                  </div>
                )
              }

              return (
                <span
                  key={index}
                  className="h-2 w-2 rounded-full bg-amber-400/40 transition-colors"
                  aria-hidden
                />
              )
            })}
          </div>
          {slides.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/80 bg-white/80 text-amber-600 transition hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
              aria-label="Next slide"
              aria-controls={slidesRegionId}
            >
              ›
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
