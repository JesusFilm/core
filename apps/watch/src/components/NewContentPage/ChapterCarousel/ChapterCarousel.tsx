import { ReactElement } from 'react'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'

import { ChapterCard } from './ChapterCard'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { styled } from '@mui/material/styles'

const StyledSwiper = styled(Swiper)(() => ({}))

interface ChapterCarouselProps {
  videos: VideoChildFields[]
}

export function ChapterCarousel({
  videos
}: ChapterCarouselProps): ReactElement {
  return (
    <div data-testid="ChapterCarousel" className="py-7">
      <StyledSwiper
        modules={[Mousewheel, FreeMode, A11y]}
        mousewheel={{
          forceToAxis: true
        }}
        observeParents
        slidesPerView={'auto'}
        pagination={{ clickable: true }}
        spaceBetween={20}
        draggable
        watchOverflow
        data-testid="ChapterCarouselSwiper"
        sx={{ display: 'flex', gap: 2, pl: 10, pr: 4 }}
      >
        {videos?.map((video) => (
          <SwiperSlide
            key={video.id}
            className="max-w-[200px]"
            data-testid={`CarouselSlide-${video.id}`}
          >
            <ChapterCard key={video.id} video={video} />
          </SwiperSlide>
        ))}
      </StyledSwiper>
    </div>
  )
}
