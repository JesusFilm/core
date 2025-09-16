import { ReactElement } from 'react'

import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Icon } from '@core/shared/ui/icons/Icon'

import { useTranslation } from 'next-i18next'

import { cn } from '../../../libs/cn'

import {
  CollectionShowcaseSource,
  useCollectionShowcaseContent
} from './useCollectionShowcaseContent'

export type { CollectionShowcaseSource } from './useCollectionShowcaseContent'

export interface CollectionShowcaseSectionProps {
  id?: string
  sources: CollectionShowcaseSource[]
  primaryCollectionId?: string
  subtitleOverride?: string
  titleOverride?: string
  descriptionOverride?: string
  ctaLabelOverride?: string
  ctaHrefOverride?: string
  watchButtonIcon?: 'Play3' | 'ArrowRight'
  analyticsTag?: string
  backgroundClassName?: string
}

export function CollectionShowcaseSection({
  id = 'collection-showcase',
  sources,
  primaryCollectionId,
  subtitleOverride,
  titleOverride,
  descriptionOverride,
  ctaLabelOverride,
  ctaHrefOverride,
  watchButtonIcon = 'Play3',
  analyticsTag,
  backgroundClassName
}: CollectionShowcaseSectionProps): ReactElement | null {
  const { t } = useTranslation('apps-watch')

  const {
    loading,
    slides,
    subtitle,
    title,
    mission,
    ctaHref,
    ctaLabel
  } = useCollectionShowcaseContent({
    sources,
    primaryCollectionId,
    subtitleOverride,
    titleOverride,
    descriptionOverride,
    ctaLabelOverride,
    ctaHrefOverride,
    defaultCtaLabel: t('Watch')
  })

  if (!loading && slides.length === 0) return null

  return (
    <section
      id={id}
      className={cn(
        'relative bg-linear-to-tr from-blue-950/10 via-purple-950/10 to-[#91214A]/90 py-16 scroll-snap-start-always',
        backgroundClassName
      )}
      data-testid="CollectionShowcaseSection"
    >
      <div className="absolute inset-0 bg-[url(/watch/assets/overlay.svg)] bg-repeat mix-blend-multiply" />
      <div className="padded relative z-2 pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            {subtitle != null && subtitle !== '' && (
              <h4
                className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70"
                data-testid="CollectionShowcaseSubtitle"
              >
                {subtitle}
              </h4>
            )}
            {title != null && title !== '' && (
              <h2
                className="text-2xl xl:text-3xl 2xl:text-4xl font-bold"
                data-testid="CollectionShowcaseTitle"
              >
                {title}
              </h2>
            )}
          </div>
          <a href={ctaHref} data-analytics-tag={analyticsTag}>
            <button
              aria-label={ctaLabel}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
              data-testid="CollectionShowcaseCTA"
            >
              <Icon
                name={watchButtonIcon}
                sx={{
                  width: 16,
                  height: 16
                }}
                data-testid="CollectionShowcaseCTAIcon"
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
          spaceBetween={0}
          pagination={{ clickable: true }}
          className="w-full"
          data-testid="CollectionShowcaseSwiper"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <SwiperSlide
                  key={`skeleton-${index}`}
                  className={cn(
                    '!w-[296px] pl-6 py-8',
                    index === 0 ? '2xl:pl-20 xl:pl-12' : ''
                  )}
                >
                  <div className="h-[444px] w-[296px] rounded-lg bg-white/10 animate-pulse" />
                </SwiperSlide>
              ))
            : slides.map((slide, index) => (
                <SwiperSlide
                  key={slide.id}
                  className={cn(
                    '!w-[296px] pl-6 py-8',
                    index === 0 ? '2xl:pl-20 xl:pl-12' : ''
                  )}
                  data-testid={`CollectionShowcaseSlide-${slide.id}`}
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
                    <div className="absolute top-0 left-0 w-full h-full outline-0 hover:outline-4 hover:outline-white rounded-lg">
                      <div className="absolute z-1 bottom-6 flex items-center justify-center w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="w-24 h-24 rounded-full bg-stone-900/60 flex items-center justify-center hover:bg-red-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-20 w-20"
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
        {(mission.highlight != null || mission.body != null) && (
          <p className="text-lg xl:text-xl mt-4 leading-relaxed text-stone-200/80" data-testid="CollectionShowcaseMission">
            {mission.highlight != null && mission.highlight !== '' && (
              <>
                <span className="text-white font-bold">{mission.highlight}</span>{' '}
              </>
            )}
            {mission.body != null && mission.body !== '' && <span>{mission.body}</span>}
          </p>
        )}
      </div>
    </section>
  )
}
