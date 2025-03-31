import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import Play3 from '@core/shared/ui/icons/Play3'

import { CollectionVideoPlayer } from '../../CollectionVideoPlayer/CollectionVideoPlayer'

interface SlideData {
  contentId: string
  imageUrl: string
  backgroundColor: string
  title: string
  type?: string
}

interface CollectionVideoContentCarouselProps {
  title: string
  subtitle: string
  description: string
  contentId: string
  videoTitle: string
  slides: SlideData[]
  mutePage: boolean
  setMutePage: (mute: boolean) => void
}

export const CollectionVideoContentCarousel = ({
  title,
  subtitle,
  description,
  contentId,
  videoTitle,
  slides,
  mutePage,
  setMutePage
}: CollectionVideoContentCarouselProps): ReactElement => {
  const { t } = useTranslation('apps-watch')
  const router = useRouter()
  const [selectedContentId, setSelectedContentId] = useState<string>(contentId)
  const [selectedVideoTitle, setSelectedVideoTitle] =
    useState<string>(videoTitle)

  const handleSeeAllClick = () => {
    void router.push(`/watch`)
  }

  const handleSlideClick = (contentId: string, title: string) => {
    if (selectedContentId === contentId) {
      return
    }

    setSelectedContentId(contentId)
    setSelectedVideoTitle(title)
  }

  const firstFourWords = description.split(' ').slice(0, 4).join(' ')
  const remainingText = description.slice(firstFourWords.length)

  return (
    <div className="relative bg-linear-to-tr from-violet-950/10 via-indigo-500/10 to-cyan-300/50 py-16">
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
          <button
            aria-label="See all videos"
            tabIndex={0}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
            onClick={handleSeeAllClick}
          >
            <Play3
              name="Play3"
              sx={{
                width: 16,
                height: 16
              }}
            />
            <span>{t('See All')}</span>
          </button>
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

      <CollectionVideoPlayer
        contentId={selectedContentId}
        title={selectedVideoTitle}
        mutePage={mutePage}
        setMutePage={setMutePage}
      />

      <div className="pt-8">
        <Swiper
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
                className="relative beveled h-[240px] flex flex-col justify-end w-full rounded-lg overflow-hidden"
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
                <div className="p-4">
                  <span className="text-xs font-medium tracking-wider uppercase text-white/60">
                    {slide.type || t('Short Video')}
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
