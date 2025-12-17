import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Icon } from '@core/shared/ui/icons/Icon'
import { cn } from '@core/shared/ui-modern/utils'

import { VideoCard } from '../VideoCard'

import {
  SectionVideoCollectionCarouselSource,
  useSectionVideoCollectionCarouselContent
} from './useSectionVideoCollectionCarouselContent'

export type { SectionVideoCollectionCarouselSource } from './useSectionVideoCollectionCarouselContent'

export interface SectionVideoCarouselProps {
  id?: string
  sources?: SectionVideoCollectionCarouselSource[]
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
  defaultBackgroundImage?: string
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
  languageId,
  defaultBackgroundImage
}: SectionVideoCarouselProps): ReactElement | null {
  const { t } = useTranslation('apps-watch')

  const {
    loading,
    slides,
    subtitle,
    title,
    description,
    ctaHref,
    ctaLabel,
    primaryCollection
  } = useSectionVideoCollectionCarouselContent({
    sources: sources ?? [],
    primaryCollectionId,
    subtitleOverride,
    titleOverride,
    descriptionOverride,
    ctaLabelOverride,
    ctaHrefOverride,
    defaultCtaLabel: t('Watch'),
    languageId
  })

  const defaultBackgroundImageUrl = useMemo(() => {
    // 1. Custom config image
    if (defaultBackgroundImage != null && defaultBackgroundImage !== '') {
      return defaultBackgroundImage
    }

    // 2. Collection banner image
    const bannerImage = primaryCollection?.bannerImages?.find(
      (image) => image?.mobileCinematicHigh != null
    )?.mobileCinematicHigh
    if (bannerImage != null) {
      return bannerImage
    }

    // 3. First slide's video thumbnail
    const firstSlideImage = slides[0]?.video.images[0]?.mobileCinematicHigh
    if (firstSlideImage != null) {
      return firstSlideImage
    }

    return null
  }, [defaultBackgroundImage, primaryCollection, slides])

  const [hoverBackground, setHoverBackground] = useState<string | null>(null)
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(false)
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize with default background if available
  useEffect(() => {
    if (defaultBackgroundImageUrl != null) {
      setHoverBackground(defaultBackgroundImageUrl)
      setIsBackgroundVisible(true)
    }
  }, [defaultBackgroundImageUrl])

  const clearTimers = useCallback(() => {
    if (showTimeoutRef.current != null) {
      clearTimeout(showTimeoutRef.current)
      showTimeoutRef.current = null
    }
    if (hideTimeoutRef.current != null) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
  }, [])

  const handleCardHoverChange = useCallback(
    (
      data?: {
        imageUrl: string
        blurhash: string
        dominantColor: string
      } | null
    ) => {
      clearTimers()

      if (data == null || data.imageUrl == null || data.imageUrl === '') {
        // Exiting hover - return to default background if available
        setIsBackgroundVisible(false)
        hideTimeoutRef.current = setTimeout(() => {
          if (defaultBackgroundImageUrl != null) {
            setHoverBackground(defaultBackgroundImageUrl)
            setIsBackgroundVisible(true)
          } else {
            setHoverBackground(null)
          }
        }, 200)
        return
      }

      // Entering hover - show hover image
      setIsBackgroundVisible(false)

      showTimeoutRef.current = setTimeout(() => {
        setHoverBackground(data.imageUrl)
        setIsBackgroundVisible(true)
      }, 40)
    },
    [clearTimers, defaultBackgroundImageUrl]
  )

  useEffect(() => () => clearTimers(), [clearTimers])
  const hasNoResults = !loading && slides.length === 0

  return (
    <section
      id={id}
      className={cn(
        'scroll-snap-start-always bg-linear-to-tr relative from-blue-950/10 via-purple-950/10 to-[#91214A]/90 py-16',
        backgroundClassName
      )}
      data-testid="SectionVideoCarousel"
    >
      <div
        className={cn(
          'sepia-off absolute inset-0 z-0 bg-cover bg-center bg-no-repeat mix-blend-overlay blur-lg filter transition-opacity duration-500 ease-in-out',
          isBackgroundVisible ? 'opacity-30' : 'opacity-0'
        )}
        style={
          hoverBackground != null
            ? { backgroundImage: `url(${hoverBackground})` }
            : undefined
        }
        aria-hidden="true"
      />
      <div className="z-1 absolute inset-0 bg-[url(/assets/overlay.svg)] bg-repeat mix-blend-multiply" />
      <div className="padded z-2 relative pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            {subtitle != null && subtitle !== '' && (
              <h4
                className="text-sm font-semibold uppercase tracking-wider text-red-100/70 xl:text-base 2xl:text-lg"
                data-testid="SectionVideoCarouselSubtitle"
              >
                {subtitle}
              </h4>
            )}
            {title != null && title !== '' && (
              <h2
                className="text-2xl font-bold xl:text-3xl 2xl:text-4xl"
                data-testid="SectionVideoCarouselTitle"
              >
                {title}
              </h2>
            )}
          </div>
          <NextLink href={ctaHref} data-analytics-tag={analyticsTag}>
            <button
              aria-label={ctaLabel}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition-colors duration-200 hover:bg-red-500 hover:text-white"
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
          </NextLink>
        </div>
      </div>

      <div className="relative">
        {hasNoResults ? (
          <div className="padded z-2 relative">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-stone-100 shadow-lg shadow-black/30">
              <p className="text-sm font-semibold uppercase tracking-wide text-red-100/80">
                {t('No videos found')}
              </p>
              <p className="mt-2 text-lg text-stone-100/80">
                {t('More content coming soon')}
              </p>
            </div>
          </div>
        ) : (
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
              ? Array.from({ length: 5 }).map((_, index) => (
                  <SwiperSlide
                    key={`skeleton-${index}`}
                    className={`max-w-[200px] py-1 ${index === 0 ? 'padded-l' : ''}`}
                  >
                    <div className="h-[300px] w-full max-w-[200px] animate-pulse rounded-lg bg-white/10" />
                  </SwiperSlide>
                ))
              : slides.map((slide, index) => (
                  <SwiperSlide
                    key={slide.id}
                    className={`max-w-[200px] py-1 ${index === 0 ? 'padded-l' : ''}`}
                    data-testid={`SectionVideoCarouselSlide-${slide.id}`}
                  >
                    <VideoCard
                      video={slide.video}
                      orientation="vertical"
                      containerSlug={slide.containerSlug}
                      analyticsTag={analyticsTag}
                      onHoverImageChange={handleCardHoverChange}
                    />
                  </SwiperSlide>
                ))}
          </Swiper>
        )}
      </div>

      <div className="padded space-y-6">
        {description != null && description !== '' && (
          <p
            className="mt-8 text-lg leading-relaxed text-stone-200/80 xl:text-xl"
            data-testid="SectionVideoCarouselDescription"
          >
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
