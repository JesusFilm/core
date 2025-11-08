import { ReactElement, useCallback } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import {
  VideoCarouselSlide,
  isMuxSlide,
  transformMuxSlide,
  transformVideoChild,
  UnifiedCardData,
  CarouselVideoLike
} from '../../../src/types/inserts'
import { VideoCard as CarouselVideoCard } from '../CarouselVideoCard/VideoCard'

import { cn } from '@core/shared/uimodern/utils'

export interface VideoCarouselProps {
  slides: VideoCarouselSlide[]
  containerSlug: string
  activeVideoId: string
  loading: boolean
  onVideoSelect?: (videoId: string) => void
}

export function VideoCarousel({
  slides,
  containerSlug,
  activeVideoId,
  loading,
  onVideoSelect
}: VideoCarouselProps): ReactElement | null {
  const transformCarouselVideoToUnifiedData = useCallback(
    (video: CarouselVideoLike): UnifiedCardData => {
      // Handle CarouselVideo (which has title: {value: string}[])
      const title =
        Array.isArray(video.title) && video.title.length > 0
          ? video.title.map((t) => t.value)
          : [video.id] // fallback

      const images =
        Array.isArray(video.images) && video.images.length > 0
          ? video.images.map((img) => ({
              mobileCinematicHigh: img.mobileCinematicHigh || ''
            }))
          : []

      const imageAlt =
        Array.isArray(video.imageAlt) && video.imageAlt.length > 0
          ? video.imageAlt.map((alt) => ({ value: alt.value }))
          : []

      return {
        id: video.id,
        title,
        images,
        imageAlt,
        label: (video as any).label || 'video',
        slug: video.slug,
        variant: video.variant ? { slug: video.variant.slug } : undefined,
        isMuxInsert: false
      }
    },
    []
  )

  const transformSlideToUnifiedData = useCallback(
    (slide: VideoCarouselSlide): UnifiedCardData => {
      if (isMuxSlide(slide)) {
        return transformMuxSlide(slide)
      } else {
        // Check if it's VideoChildFields (has __typename) or CarouselVideo
        if ('__typename' in slide.video) {
          return transformVideoChild(slide.video)
        } else {
          return transformCarouselVideoToUnifiedData(slide.video)
        }
      }
    },
    [transformCarouselVideoToUnifiedData]
  )

  if (!loading && slides.length === 0) return null

  return (
    <div className="w-full">
      <Swiper
        modules={[Mousewheel, FreeMode, A11y]}
        mousewheel={{ forceToAxis: true }}
        observeParents
        slidesPerView="auto"
        spaceBetween={0}
        slidesOffsetAfter={32}
        className="w-full h-auto [&>div]:py-4"
        data-testid="VideoCarousel"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <SwiperSlide
                key={`skeleton-${index}`}
                className={`max-w-[140px] md:max-w-[200px] mr-2 md:mr-3 ${index === 0 ? 'padded-l' : ''}`}
                  
              >
                <div className="h-[330px] w-[220px] rounded-lg bg-white/10 animate-pulse" />
              </SwiperSlide>
            ))
          : slides.map((slide, index) => {
              const unifiedData = transformSlideToUnifiedData(slide)
              return (
                <SwiperSlide
                  key={slide.id}
                  className={`max-w-[140px] md:max-w-[260px] !h-34 mr-2 md:mr-3 flex flex-col ${index === 0 ? 'padded-l' : ''}`}
                  
                  data-testid={`VideoCarouselSlide-${slide.id}`}
                >
                  <div
                    className={cn(
                      'transition-opacity duration-200 flex flex-col flex-1 h-full min-h-full w-full',
                      slide.id === activeVideoId
                        ? 'opacity-100'
                        : 'opacity-60 hover:opacity-80'
                    )}
                  >
                    <CarouselVideoCard
                      data={unifiedData}
                      containerSlug={containerSlug}
                      active={slide.id === activeVideoId}
                      onVideoSelect={onVideoSelect}
                    />
                  </div>
                </SwiperSlide>
              )
            })}
      </Swiper>
    </div>
  )
}
