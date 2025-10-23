import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from 'react'

import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
import type { CarouselApi } from './ui/carousel'

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
  const SLIDE_DURATION = 8000
  const prefersReducedMotion = usePrefersReducedMotion()
  const carouselId = useId()
  const slidesRegionId = `${carouselId}-slides`
  const indicatorRegionId = `${carouselId}-indicators`
  const slides = useMemo<PrayerSlide[]>(
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
      className="mt-6 overflow-hidden rounded-3xl transition-all duration-700 ease-out"
      style={{
        maxHeight: isVisible ? 360 : 0,
        opacity: isVisible ? 1 : 0,
        paddingTop: isVisible ? '24px' : '0px',
        paddingBottom: isVisible ? '24px' : '0px'
      }}
    >
      <div className="relative px-6 md:px-10">
        <div
          className="absolute right-6 top-6 z-10 flex flex-row items-center justify-end gap-4 min-w-[380px]"
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
                    className="relative h-1.5 w-12 overflow-hidden rounded-full bg-amber-500/20"
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
                <CarouselItem key={slide.title}>
                  <div
                    className="flex h-full flex-col justify-top gap-4"
                    aria-hidden={!isCurrent}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500/90">
                      During this moment
                    </span>
                    <h3 className="text-xl font-semibold text-amber-900 md:text-2xl">
                      {slide.title}
                    </h3>
                    {slide.body != null && (
                      <p className="text-sm leading-relaxed text-amber-900/80 whitespace-pre-line md:text-base">
                        {slide.body}
                      </p>
                    )}
                    {slide.verse != null && (
                      <p className="text-sm italic leading-relaxed text-amber-900/80 whitespace-pre-line md:text-base">
                        {slide.verse}
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
      </div>
    </div>
  )
}
