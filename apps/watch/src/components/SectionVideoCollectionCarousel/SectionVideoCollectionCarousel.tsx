import { ReactElement } from 'react'

import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Icon } from '@core/shared/ui/icons/Icon'

import { useTranslation } from 'next-i18next'

import { cn } from '../../libs/cn'

import {
  SectionVideoCollectionCarouselSource,
  useSectionVideoCollectionCarouselContent
} from './useSectionVideoCollectionCarouselContent'

export type { SectionVideoCollectionCarouselSource } from './useSectionVideoCollectionCarouselContent'

export interface SectionVideoCollectionCarouselProps {
  id?: string
  sources: SectionVideoCollectionCarouselSource[]
  primaryCollectionId?: string
  subtitleOverride?: string
  titleOverride?: string
  descriptionOverride?: string
  ctaLabelOverride?: string
  ctaHrefOverride?: string
  watchButtonIcon?: 'Play3' | 'ArrowRight'
  analyticsTag?: string
  backgroundClassName?: string
  languageId?: string
}

export function SectionVideoCollectionCarousel({
  id = 'section-video-collection-carousel',
  sources,
  primaryCollectionId,
  subtitleOverride,
  titleOverride,
  descriptionOverride,
  ctaLabelOverride,
  ctaHrefOverride,
  watchButtonIcon = 'Play3',
  analyticsTag,
  backgroundClassName,
  languageId
}: SectionVideoCollectionCarouselProps): ReactElement | null {
  const { t } = useTranslation('apps-watch')

  const {
    loading,
    slides,
    subtitle,
    title,
    description,
    ctaHref,
    ctaLabel
  } = useSectionVideoCollectionCarouselContent({
    sources,
    primaryCollectionId,
    subtitleOverride,
    titleOverride,
    descriptionOverride,
    ctaLabelOverride,
    ctaHrefOverride,
    defaultCtaLabel: t('Watch'),
    languageId
  })

  if (!loading && slides.length === 0) return null

  return (
    <section
      id={id}
      className={cn(
        'relative bg-linear-to-tr from-blue-950/10 via-purple-950/10 to-[#91214A]/90 py-16 scroll-snap-start-always',
        backgroundClassName
      )}
      data-testid="SectionVideoCollectionCarousel"
    >
      <div className="absolute inset-0 bg-[url(/watch/assets/overlay.svg)] bg-repeat mix-blend-multiply" />
      <div className="padded relative z-2 pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            {subtitle != null && subtitle !== '' && (
              <h4
                className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70"
                data-testid="SectionVideoCollectionCarouselSubtitle"
              >
                {subtitle}
              </h4>
            )}
            {title != null && title !== '' && (
              <h2
                className="text-2xl xl:text-3xl 2xl:text-4xl font-bold"
                data-testid="SectionVideoCollectionCarouselTitle"
              >
                {title}
              </h2>
            )}
          </div>
          <a href={ctaHref} data-analytics-tag={analyticsTag}>
            <button
              aria-label={ctaLabel}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
              data-testid="SectionVideoCollectionCarouselCTA"
            >
              <Icon
                name={watchButtonIcon}
                sx={{
                  width: 16,
                  height: 16
                }}
                data-testid="SectionVideoCollectionCarouselCTAIcon"
              />
              <span>{ctaLabel}</span>
            </button>
          </a>
        </div>
      </div>

      <div className="relative">
        <Swiper
          modules={[Mousewheel, FreeMode, A11y]}
          mousewheel={{ forceToAxis: true }}
          observeParents
          slidesPerView="auto"
          spaceBetween={20}
        slidesOffsetAfter={40}
          pagination={{ clickable: true }}
          className="w-full"
          data-testid="SectionVideoCollectionCarouselSwiper"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <SwiperSlide
                  key={`skeleton-${index}`}
                  className={`max-w-[200px] ${index === 0 ? 'padded-l' : ''}`}
                  

                >
                  <div className="h-[330px] w-[220px] rounded-lg bg-white/10 animate-pulse" />
                </SwiperSlide>
              ))
            : slides.map((slide, index) => (
                <SwiperSlide
                  key={slide.id}
                  className={`max-w-[200px] py-1 ${index === 0 ? 'padded-l' : ''}`}
                  
                  data-testid={`SectionVideoCollectionCarouselSlide-${slide.id}`}
                >
                  <a
                    href={slide.href}
                    className="block relative group shadow-xl shadow-stone-950/70 beveled"
                    aria-label={t('Watch {{title}}', { title: slide.title })}
                    data-analytics-tag={analyticsTag}
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.alt}
                      className="w-full aspect-[2/3] object-cover rounded-lg"
                    />
                    <div className="absolute top-0 left-0 w-full h-full outline-4 outline-transparent hover:outline-white rounded-lg">
                      <div className="absolute z-1 bottom-4 flex items-center justify-center w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-16 h-16 rounded-full bg-stone-900/60 flex items-center justify-center hover:bg-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                </SwiperSlide>
              ))}
        </Swiper>
      </div>

      <div className="padded space-y-6">
        {description != null && description !== '' && (
          <p className="text-lg xl:text-xl mt-8 leading-relaxed text-stone-200/80" data-testid="SectionVideoCollectionCarouselDescription">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
