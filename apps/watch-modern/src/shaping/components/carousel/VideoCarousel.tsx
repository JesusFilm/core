'use client'

import { useRef } from 'react'
import type { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import type { Video } from '../../types/homepage.types'
import { VideoCard } from '../cards'

interface VideoCarouselProps {
  videos: Video[]
  title?: string
  description?: string
}

export function VideoCarousel({
  videos,
  title,
  description
}: VideoCarouselProps): ReactElement {
  const nextRef = useRef<HTMLButtonElement>(null)
  const prevRef = useRef<HTMLButtonElement>(null)
  const noVideosText = 'No videos available'

  console.log('VideoCarousel videos:', videos)

  return (
    <div className="mb-12">
      {/* Section Header */}
      {title && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          {description && (
            <p className="mt-2 text-stone-200/80">{description}</p>
          )}
        </div>
      )}

      {/* Carousel */}
      <div className="relative h-80">
        {videos.length === 0 ? (
          <div className="flex items-center justify-center h-full text-stone-400">
            <p>{noVideosText}</p>
          </div>
        ) : (
          <>
            <Swiper
              modules={[Mousewheel, FreeMode, A11y, Navigation]}
              mousewheel={{
                forceToAxis: true
              }}
              grabCursor
              observeParents
              slidesPerView={'auto'}
              pagination={{ clickable: true }}
              draggable
              watchOverflow
              spaceBetween={20}
              slidesOffsetBefore={0}
              slidesOffsetAfter={0}
              navigation={{
                nextEl: nextRef.current,
                prevEl: prevRef.current
              }}
              className="!overflow-visible"
            >
              {videos.map((video) => (
                <SwiperSlide
                  key={video.id}
                  className="max-w-[200px]"
                >
                  <VideoCard video={video} />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Buttons */}
            <button
              ref={prevRef}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Previous video"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              ref={nextRef}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Next video"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
} 