import { useTheme } from '@mui/material/styles'
import { ReactElement, useEffect, useMemo, useRef } from 'react'
import { A11y, FreeMode, Mousewheel, Navigation, Virtual } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SwiperOptions , Swiper as SwiperType } from 'swiper/types'

import {
  type VideoCarouselSlide,
  isMuxSlide,
  isVideoSlide,
  transformMuxSlide,
  transformVideoChild
} from '../../../types/inserts'
import { useVideoCarousel } from '../../../libs/videoCarouselContext'
import { Skeleton } from '../../Skeleton'
import { NavButton } from '../../VideoCarousel/NavButton/NavButton'

import { VideoCard } from './VideoCard'

interface VideoCarouselProps {
  containerSlug?: string
  activeVideoId?: string
  onVideoSelect?: (videoId: string) => void
  onSlideChange?: (activeIndex: number) => void
}

const SKELETON_COUNT = 11

export function VideoCarousel({
  containerSlug,
  activeVideoId,
  onVideoSelect,
  onSlideChange
}: VideoCarouselProps): ReactElement {
  // Always use context since VideoCarouselProvider is now required
  const { activeVideoId: contextActiveVideoId, slides, loading, setActiveVideo } = useVideoCarousel()

  // Use context values, with prop fallbacks for compatibility
  const finalActiveVideoId = contextActiveVideoId ?? activeVideoId
  const finalLoading = loading

  const mode =
    onVideoSelect && onSlideChange ? 'inlinePlayback' : 'externalPlayback'
  const { breakpoints } = useTheme()

  // Use slides directly from context
  const computedSlides = slides
  const nextRef = useRef<HTMLDivElement>(null)
  const prevRef = useRef<HTMLDivElement>(null)
  const swiperRef = useRef<SwiperType | null>(null)

  const swiperBreakpoints: SwiperOptions['breakpoints'] = useMemo(
    () => ({
      [breakpoints.values.xs]: {
        slidesPerGroup: 2,
        slidesPerView: 2.4
      },
      [breakpoints.values.sm]: {
        slidesPerGroup: 3,
        slidesPerView: 3.4
      },
      [breakpoints.values.md]: {
        slidesPerGroup: 4,
        slidesPerView: 4.4
      },
      [breakpoints.values.lg]: {
        slidesPerGroup: 5,
        slidesPerView: 5.4
      },
      [breakpoints.values.xl]: {
        slidesPerGroup: 6,
        slidesPerView: 6.4
      },
      [breakpoints.values.xxl]: {
        slidesPerGroup: 7,
        slidesPerView: 7.4
      }
    }),
    [breakpoints.values]
  )

  const skeletons = useMemo(
    () =>
      Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <SwiperSlide
          key={`skeleton-${i}`}
          virtualIndex={i}
          className="max-w-[200px]"
        >
          <Skeleton width={200} height={240} />
        </SwiperSlide>
      )),
    []
  )

  // Handle video selection using Swiper's navigation
  const handleVideoSelect = (videoId: string) => {
    const index = computedSlides.findIndex((slide) => slide.id === videoId)
    if (index >= 0 && swiperRef.current) {
      swiperRef.current.slideTo(index)
    }
    setActiveVideo?.(videoId)
  }

  // Always be at the end when videos change (only in inline playback mode)
  useEffect(() => {
    if (
      mode === 'inlinePlayback' &&
      swiperRef.current &&
      computedSlides.length > 0
    ) {
      swiperRef.current.slideTo(computedSlides.length - 1, 0)
    }
  }, [computedSlides.length])

  // Check every 15 seconds and scroll to end if not already there (only in inline playback mode)
  useEffect(() => {
    // if (mode !== 'inlinePlayback') return
    const interval = setInterval(() => {
      if (swiperRef.current && computedSlides.length > 0) {
        // Find the current video index
        const currentVideoIndex = computedSlides.findIndex((s) =>
          isVideoSlide(s) ? s.video.id === activeVideoId : false
        )

        // Only scroll to end if current playing card is not one of the first 5 cards
        if (currentVideoIndex >= 5) {
          const lastSlideIndex = computedSlides.length - 1
          swiperRef.current.slideTo(lastSlideIndex, 1800)
        }
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [computedSlides.length, activeVideoId, mode])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!swiperRef.current) return

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        swiperRef.current.slidePrev()
        break
      case 'ArrowRight':
        event.preventDefault()
        swiperRef.current.slideNext()
        break
    }
  }

  return (
    <div
      data-testid="VideoCarousel"
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Video carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Swiper
        data-testid="VideoCarouselSwiper"
        modules={[Virtual, Mousewheel, FreeMode, A11y, Navigation]}
        virtual
        observer={true}
        observeParents={true}
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        onSlideChange={(swiper) => {
          onSlideChange?.(swiper.activeIndex)
        }}
        mousewheel={{ forceToAxis: true }}
        grabCursor
        slidesPerView="auto"
        spaceBetween={20}
        slidesOffsetAfter={40}
        navigation={{
          nextEl: nextRef.current,
          prevEl: prevRef.current
        }}
        breakpoints={swiperBreakpoints}
      >
        {finalLoading
          ? skeletons
          : computedSlides.map((slide, index) => {
              // Find the current video index
              const currentVideoIndex = computedSlides.findIndex((s) =>
                isVideoSlide(s) ? s.video.id === finalActiveVideoId : false
              )
              // Make slides after the current video transparent (only in inline playback mode)
              const isAfterCurrentVideo =
                mode === 'inlinePlayback' &&
                currentVideoIndex >= 0 &&
                index > currentVideoIndex

              return (
                <SwiperSlide
                  key={
                    isMuxSlide(slide)
                      ? `mux-${slide.id}-${slide.playbackIndex}`
                      : `video-${slide.id}`
                  }
                  virtualIndex={index}
                  className={`max-w-[200px] ${index === 0 ? 'padded-l' : ''}`}
                  data-testid={`CarouselSlide-${slide.id}`}
                >
                  <VideoCard
                    containerSlug={containerSlug}
                    data={isMuxSlide(slide) ? transformMuxSlide(slide) : transformVideoChild(slide.video as VideoChildFields)}
                    active={finalActiveVideoId === slide.id}
                    transparent={isAfterCurrentVideo}
                    onVideoSelect={handleVideoSelect}
                  />
                </SwiperSlide>
              )
            })}
      </Swiper>
      <NavButton variant="prev" ref={prevRef} />
      <NavButton variant="next" ref={nextRef} />
    </div>
  )
}
