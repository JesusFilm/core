import Image from 'next/image'
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { VideoContentFields_bibleCitations as BibleCitation } from '../../../../__generated__/VideoContentFields'

import { BibleCitationCard } from './BibleCitationsCard/BibleCitationCard'
import { FreeResourceCard, type FreeResourceProps } from './FreeResourceCard'

const bibleImages = [
  'https://images.unsplash.com/photo-1480869799327-03916a613b29?q=80&w=1632&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/16/unsplash_526360a842e20_1.JPG?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1497333558196-daaff02b56d0?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1555892727-55b51e5fceae?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1631125915973-e0d155a14e4e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1659260145900-1ac1afc45dcf?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1535979863199-3c77338429a0?q=80&w=1660&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
]

interface BibleCitationsProps {
  bibleCitations: BibleCitation[]
  freeResource?: FreeResourceProps
}

export function BibleCitations({
  bibleCitations,
  freeResource
}: BibleCitationsProps): ReactElement {
  return (
    <div className="flex flex-row gap-2 z-10" data-testid="BibleCitations">
      <Swiper
        modules={[Mousewheel, FreeMode, A11y]}
        grabCursor
        observeParents
        mousewheel={{
          forceToAxis: true
        }}
        watchOverflow
        slidesPerView={'auto'}
        pagination={{ clickable: true }}
        spaceBetween={48}
        className="w-full"
      >
        {bibleCitations.map((citation, i) => (
          <SwiperSlide key={i} className="max-w-[400px]">
            <BibleCitationCard
              citation={citation}
              imageUrl={bibleImages?.[i] ?? bibleImages[0]}
            />
          </SwiperSlide>
        ))}
        {freeResource != null && (
          <SwiperSlide key="free-resource" className="max-w-[400px]">
            <FreeResourceCard {...freeResource} />
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  )
}
