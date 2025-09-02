import Image from 'next/image'
import { ReactElement, useState } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { CollectionVideoPlayer } from '../CollectionVideoPlayer/CollectionVideoPlayer'

import { SeeAllButton } from './SeeAllButton'

interface SlideData {
  contentId: string
  imageUrl: string
  backgroundColor: string
  title: string
  type?: string
}

interface CollectionVideoContentCarouselProps {
  /** ID for the scroll navigation */
  id: string
  title: string
  subtitle: string
  description: string
  contentId: string
  videoTitle: string
  slides: SlideData[]
  mutePage: boolean
  setMutePage: (mute: boolean) => void
  seeAllText: string
  shortVideoText: string
}

export const CollectionVideoContentCarousel = ({
  id,
  title,
  subtitle,
  description,
  contentId,
  videoTitle,
  slides,
  mutePage,
  setMutePage,
  seeAllText,
  shortVideoText
}: CollectionVideoContentCarouselProps): ReactElement => {
  const [selectedContentId, setSelectedContentId] = useState<string>(contentId)

  const handleSlideClick = (contentId: string, title: string) => {
    if (selectedContentId === contentId) {
      return
    }

    setSelectedContentId(contentId)
  }

  const firstFourWords = description.split(' ').slice(0, 4).join(' ')
  const remainingText = description.slice(firstFourWords.length)

  return (
    <div
      id={id}
      className="relative bg-linear-to-tr from-violet-950/10 via-indigo-500/10 to-cyan-300/50 py-16 scroll-snap-start-always"
    >
      <hr className="section-divider" />

      <div className="absolute inset-0 overlay-texture-image bg-repeat mix-blend-multiply"></div>
      <div className="padded z-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70 xl:mb-1 mb-0">
                {subtitle}
              </h4>
              <h3 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold mb-0 text-balance">
                {title}
              </h3>
            </div>
          </div>
          <SeeAllButton text={seeAllText} />
        </div>
      </div>

      <div className="padded space-y-6 pt-6 pb-10">
        <p className="text-lg xl:text-xl mt-2 leading-relaxed text-stone-200/80">
          <span style={{ fontWeight: 'bold', color: 'white' }}>
            {firstFourWords}
          </span>
          {remainingText}
        </p>
      </div>

      {slides.map((slide) => {
        if (slide.contentId === selectedContentId) {
          return (
            <CollectionVideoPlayer
              key={slide.contentId}
              contentId={slide.contentId}
              title={slide.title}
              mutePage={mutePage}
              setMutePage={setMutePage}
            />
          )
        }
      })}

      <div className="pt-8">
        <Swiper
          modules={[Mousewheel, FreeMode, A11y]}
          mousewheel={{
            forceToAxis: true
          }}
          observeParents
          data-testid="CollectionVideoContentCarousel"
          slidesPerView={'auto'}
          pagination={{ clickable: true }}
          spaceBetween={20}
        >
          {slides.map((slide, index) => (
            <SwiperSlide
              key={slide.contentId}
              className={`max-w-[200px] ${index === 0 ? 'pl-6 2xl:pl-20 xl:pl-12' : ''} ${index === slides.length - 1 ? 'pr-6' : ''} cursor-pointer`}
            >
              <div
                onClick={() => handleSlideClick(slide.contentId, slide.title)}
                className={`group relative beveled h-[240px] flex flex-col justify-end w-full rounded-lg overflow-hidden m-1 ${selectedContentId === slide.contentId ? 'outline-4 outline-white' : ''} `}
                style={{ backgroundColor: slide.backgroundColor }}
                data-testid="CollectionVideoContentCarouselSlides"
              >
                <Image
                  width={200}
                  height={240}
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
                />
                <div className="hidden group-hover:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-stone-900/60 items-center justify-center hover:bg-red-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-20 w-20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="p-4">
                  <span className="text-xs font-medium tracking-wider uppercase text-white/60">
                    {slide.type || shortVideoText}
                  </span>
                  <h3 className="text-base font-bold text-white/90 leading-tight line-clamp-3">
                    {slide.title}
                  </h3>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}
