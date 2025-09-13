import { useTheme } from '@mui/material/styles'
import { ReactElement, useRef, useMemo, useEffect } from 'react'
import { A11y, FreeMode, Mousewheel, Navigation, Virtual } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'
import { Swiper as SwiperType } from 'swiper/types'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { Skeleton } from '../../Skeleton'
import { NavButton } from '../../VideoCarousel/NavButton/NavButton'

import { VideoCard } from './VideoCard'

interface VideoCarouselProps {
  videos: VideoChildFields[]
  containerSlug?: string
  activeVideoId?: string
  loading?: boolean
  onVideoSelect?: (videoId: string) => void
  onSlideChange?: (activeIndex: number) => void
}

const SKELETON_COUNT = 11

export function VideoCarousel({
  videos,
  containerSlug,
  activeVideoId,
  loading = false,
  onVideoSelect,
  onSlideChange
}: VideoCarouselProps): ReactElement {
  const mode =
    onVideoSelect && onSlideChange ? 'inlinePlayback' : 'externalPlayback'
  const { breakpoints } = useTheme()
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
    const index = videos.findIndex((video) => video.id === videoId)
    if (index >= 0 && swiperRef.current) {
      swiperRef.current.slideTo(index)
    }
    onVideoSelect?.(videoId)
  }

  // Always be at the end when videos change (only in inline playback mode)
  useEffect(() => {
    if (mode === 'inlinePlayback' && swiperRef.current && videos.length > 0) {
      swiperRef.current.slideTo(videos.length - 1, 0)
    }
  }, [videos.length])

  // Check every 15 seconds and scroll to end if not already there (only in inline playback mode)
  useEffect(() => {
    if (mode !== 'inlinePlayback') return
    const interval = setInterval(() => {
      if (swiperRef.current && videos.length > 0) {
        const lastSlideIndex = videos.length - 1

        swiperRef.current.slideTo(lastSlideIndex, 1800)
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [])

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
        {loading
          ? skeletons
          : videos.map((video, index) => {
              // Find the current video index
              const currentVideoIndex = videos.findIndex(
                (v) => v.id === activeVideoId
              )
              // Make slides after the current video transparent (only in inline playback mode)
              const isAfterCurrentVideo =
                mode === 'inlinePlayback' &&
                currentVideoIndex >= 0 &&
                index > currentVideoIndex

              return (
                <SwiperSlide
                  key={video.id}
                  virtualIndex={index}
                  className={`max-w-[200px] ${index === 0 ? 'padded-l' : ''}`}
                  data-testid={`CarouselSlide-${video.id}`}
                >
                  <VideoCard
                    containerSlug={containerSlug}
                    video={video}
                    active={activeVideoId === video.id}
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
