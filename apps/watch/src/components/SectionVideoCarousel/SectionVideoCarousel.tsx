import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Icon } from '@core/shared/ui/icons/Icon'
import type { VideoChildFields } from '../../../__generated__/VideoChildFields'

import { VideoCard } from '../VideoCard'

import { cn } from '../../libs/cn'

import {
  SectionVideoCollectionCarouselSource,
  SectionVideoCollectionCarouselSlide,
  useSectionVideoCollectionCarouselContent
} from './useSectionVideoCollectionCarouselContent'

export type { SectionVideoCollectionCarouselSource } from './useSectionVideoCollectionCarouselContent'

export interface SectionVideoCarouselProps {
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

export function SectionVideoCarousel({
  id = 'section-video-carousel',
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
}: SectionVideoCarouselProps): ReactElement | null {
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

  // Transform SectionVideoCollectionCarouselSlide to VideoChildFields format for VideoCard
  const transformSlideToVideoChildFields = (
    slide: SectionVideoCollectionCarouselSlide
  ): { video: VideoChildFields; containerSlug?: string } => {
    const normalizedHref = slide.href.replace(/^[\/]+/, '')
    const hrefWithoutPrefix = normalizedHref.startsWith('watch/')
      ? normalizedHref.slice('watch/'.length)
      : normalizedHref
    const segments = hrefWithoutPrefix
      .split('/')
      .filter((segment) => segment !== '')
      .map((segment) => segment.replace(/\.html?$/i, ''))

    const containerSlug = segments.length > 2 ? segments[0] : undefined
    const variantSlugSegments = (containerSlug != null ? segments.slice(1) : segments).filter(
      (segment) => segment !== ''
    )
    const resolvedContainerSlug = containerSlug ?? ''
    const resolvedVariantSlug =
      variantSlugSegments.length > 0 ? variantSlugSegments.join('/') : ''

    return {
      video: {
        __typename: 'Video',
        id: slide.id,
        label: slide.label || 'video', // fallback to 'video' if label is undefined
        title: [{ __typename: 'VideoTitle', value: slide.title }],
        images: [{ __typename: 'CloudflareImage', mobileCinematicHigh: slide.imageUrl }],
        imageAlt: [{ __typename: 'VideoImageAlt', value: slide.alt }],
        snippet: slide.snippet ? [{ __typename: 'VideoSnippet', value: slide.snippet }] : [],
        slug: resolvedContainerSlug,
        variant: {
          __typename: 'VideoVariant',
          id: `${slide.id}-variant`,
          duration: 0, // We don't have duration from the slide, default to 0
          hls: null,
          slug: resolvedVariantSlug
        },
        childrenCount: 0 // Default to 0, we don't have this info from the slide
      },
      containerSlug: containerSlug ?? undefined
    }
  }

  return (
    <section
      id={id}
      className={cn(
        'relative bg-linear-to-tr from-blue-950/10 via-purple-950/10 to-[#91214A]/90 py-16 scroll-snap-start-always',
        backgroundClassName
      )}
      data-testid="SectionVideoCarousel"
    >
      <div className="absolute inset-0 bg-[url(/watch/assets/overlay.svg)] bg-repeat mix-blend-multiply" />
      <div className="padded relative z-2 pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            {subtitle != null && subtitle !== '' && (
              <h4
                className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70"
                data-testid="SectionVideoCarouselSubtitle"
              >
                {subtitle}
              </h4>
            )}
            {title != null && title !== '' && (
              <h2
                className="text-2xl xl:text-3xl 2xl:text-4xl font-bold"
                data-testid="SectionVideoCarouselTitle"
              >
                {title}
              </h2>
            )}
          </div>
          <a href={ctaHref} data-analytics-tag={analyticsTag}>
            <button
              aria-label={ctaLabel}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
              data-testid="SectionVideoCarouselCTA"
            >
              <Icon
                name={watchButtonIcon}
                sx={{
                  width: 16,
                  height: 16
                }}
                data-testid="SectionVideoCarouselCTAIcon"
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
          data-testid="SectionVideoCarouselSwiper"
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
            : slides.map((slide, index) => {
                const { video, containerSlug } = transformSlideToVideoChildFields(slide)
                return (
                  <SwiperSlide
                    key={slide.id}
                    className={`max-w-[200px] py-1 ${index === 0 ? 'padded-l' : ''}`}
                    data-testid={`SectionVideoCarouselSlide-${slide.id}`}
                  >
                    <VideoCard
                      video={video}
                      orientation="vertical"
                      containerSlug={containerSlug}
                      analyticsTag={analyticsTag}
                    />
                  </SwiperSlide>
                )
              })}
        </Swiper>
      </div>

      <div className="padded space-y-6">
        {description != null && description !== '' && (
          <p className="text-lg xl:text-xl mt-8 leading-relaxed text-stone-200/80" data-testid="SectionVideoCarouselDescription">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
