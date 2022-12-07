import { ReactElement, ReactNode } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { VideoChildFields } from '../../../../__generated__/VideoChildFields'

interface VideosCarouselProps {
  videos: VideoChildFields[]
  loading?: boolean
  renderItem: (props: unknown) => ReactNode
  onLoadMore?: () => Promise<void> | undefined
}

export function VideosCarousel({
  videos,
  loading = false,
  renderItem,
  onLoadMore
}: VideosCarouselProps): ReactElement {
  const handleLoadMore = async (): Promise<void> => {
    if (onLoadMore != null) await onLoadMore()
  }

  return (
    <Swiper
      data-testid="videos-carousel"
      spaceBetween={20}
      slidesPerView="auto"
      width={null}
      // TODO: add a11y https://github.com/nolimits4web/swiper/issues/3824
      onSlideNextTransitionStart={(swiper) => {
        console.log('slide next transition', swiper.activeIndex)
        if (swiper.activeIndex > videos.length - 8) {
          void handleLoadMore()
        }
      }}
    >
      {videos.map((video, index) => (
        <SwiperSlide key={index} style={{ width: 'auto' }}>
          {({ isActive }) => {
            return renderItem({ ...video, loading })
          }}
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
