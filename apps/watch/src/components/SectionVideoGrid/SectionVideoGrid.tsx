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

import { Icon } from '@core/shared/ui/icons/Icon'
import { cn } from '@core/shared/ui-modern/utils'

import { blurImage } from '../../libs/blurhash'
import {
  SectionVideoCollectionCarouselSource,
  extractVideosAndContainerSlugMap,
  useSectionVideoCollectionCarouselContent
} from '../SectionVideoCarousel/useSectionVideoCollectionCarouselContent'
import { VideoGrid } from '../VideoGrid/VideoGrid'

export type SectionVideoGridSource = SectionVideoCollectionCarouselSource

function isValueDisabled(value: string | false | null | undefined): boolean {
  return value === '' || value === false || value === null
}

function hasHeaderContent(
  subtitle: string | undefined,
  title: string | undefined,
  ctaHref: string | undefined,
  ctaLabel: string | undefined,
  subtitleOverride: string | false | null | undefined,
  titleOverride: string | false | null | undefined,
  ctaHrefOverride: string | false | null | undefined,
  ctaLabelOverride: string | false | null | undefined
): boolean {
  // Check if subtitle should render (not disabled by override and has content)
  const subtitleEnabled =
    !isValueDisabled(subtitleOverride) && subtitle != null && subtitle !== ''
  // Check if title should render (not disabled by override and has content)
  const titleEnabled =
    !isValueDisabled(titleOverride) && title != null && title !== ''
  // Check if CTA should render (not disabled by overrides and has content)
  const ctaEnabled =
    !isValueDisabled(ctaHrefOverride) &&
    !isValueDisabled(ctaLabelOverride) &&
    ctaHref != null &&
    ctaHref !== '' &&
    ctaLabel != null &&
    ctaLabel !== ''

  return subtitleEnabled || titleEnabled || ctaEnabled
}

export interface SectionVideoGridProps {
  id?: string
  sources?: SectionVideoGridSource[]
  primaryCollectionId?: string
  subtitleOverride?: string | false | null
  titleOverride?: string | false | null
  descriptionOverride?: string | false | null
  ctaLabelOverride?: string | false | null
  ctaHrefOverride?: string | false | null
  watchButtonIcon?: 'Play3' | 'ArrowRight'
  analyticsTag?: string
  backgroundClassName?: string
  orientation?: 'horizontal' | 'vertical'
  languageId?: string
  showSequenceNumbers?: boolean
  limitChildren?: number
  defaultBackgroundImage?: string
}

export function SectionVideoGrid({
  id = 'section-video-grid',
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
  orientation = 'horizontal',
  languageId,
  showSequenceNumbers = false,
  limitChildren = 12,
  defaultBackgroundImage
}: SectionVideoGridProps): ReactElement | null {
  const { t } = useTranslation('apps-watch')

  const resolvedSources = useMemo((): SectionVideoGridSource[] => {
    if (sources != null) return sources
    if (primaryCollectionId != null) {
      return [
        { type: 'collection' as const, id: primaryCollectionId, limitChildren }
      ]
    }
    return []
  }, [sources, primaryCollectionId, limitChildren])

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
    sources: resolvedSources,
    primaryCollectionId,
    subtitleOverride:
      subtitleOverride === false ? undefined : subtitleOverride || undefined,
    titleOverride:
      titleOverride === false ? undefined : titleOverride || undefined,
    descriptionOverride:
      descriptionOverride === false
        ? undefined
        : descriptionOverride || undefined,
    ctaLabelOverride:
      ctaLabelOverride === false ? undefined : ctaLabelOverride || undefined,
    ctaHrefOverride:
      ctaHrefOverride === false ? undefined : ctaHrefOverride || undefined,
    defaultCtaLabel: t('Watch'),
    languageId
  })

  const { videos, containerSlugMap } = useMemo(
    () => extractVideosAndContainerSlugMap(slides),
    [slides]
  )

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

    // 3. First video thumbnail
    const firstVideoImage = videos[0]?.images[0]?.mobileCinematicHigh
    if (firstVideoImage != null) {
      return firstVideoImage
    }

    return null
  }, [defaultBackgroundImage, primaryCollection, videos])

  const [hoverBackground, setHoverBackground] = useState<string | null>(null)
  const [hoverBlurhash, setHoverBlurhash] = useState<string | null>(null)
  const [hoverDominantColor, setHoverDominantColor] =
    useState<string>('#000000')
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
            setHoverBlurhash(null)
            setHoverDominantColor('#000000')
            setIsBackgroundVisible(true)
          } else {
            setHoverBackground(null)
            setHoverBlurhash(null)
            setHoverDominantColor('#000000')
          }
        }, 200)
        return
      }

      // Entering hover - show hover image
      setIsBackgroundVisible(false)

      showTimeoutRef.current = setTimeout(() => {
        setHoverBackground(data.imageUrl)
        setHoverBlurhash(data.blurhash || null)
        setHoverDominantColor(data.dominantColor || '#000000')
        setIsBackgroundVisible(true)
      }, 40)
    },
    [clearTimers, defaultBackgroundImageUrl]
  )

  // Generate blurDataURL from blurhash
  const blurDataURL =
    hoverBlurhash != null
      ? blurImage(hoverBlurhash, hoverDominantColor)
      : undefined

  const hasNoResults = !loading && slides.length === 0

  useEffect(() => () => clearTimers(), [clearTimers])

  return (
    <section
      id={id}
      className={cn(
        'scroll-snap-start-always relative overflow-hidden py-16',
        backgroundClassName
      )}
      data-testid="SectionVideoGrid"
    >
      {/* Blurhash Layer - Behind everything */}
      {blurDataURL && (
        <div
          className={cn(
            'absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ease-in-out',
            isBackgroundVisible ? 'opacity-40' : 'opacity-0'
          )}
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          aria-hidden="true"
        />
      )}
      {/* First Background Image Layer */}
      <div
        className={cn(
          'sepia-off absolute inset-0 z-0 bg-cover bg-center bg-no-repeat mix-blend-overlay blur-md filter transition-opacity duration-500 ease-in-out',
          isBackgroundVisible ? 'opacity-30' : 'opacity-0'
        )}
        style={
          hoverBackground != null
            ? {
                backgroundImage: `url(${hoverBackground})`
              }
            : undefined
        }
        aria-hidden="true"
      />
      {/* Second Background Image Layer */}
      <div
        className={cn(
          'sepia-off animate-background-pan-zoom absolute inset-0 z-0 bg-no-repeat mix-blend-overlay blur-xl brightness-[.5] saturate-2 filter',
          isBackgroundVisible ? 'opacity-40' : 'opacity-0'
        )}
        style={
          hoverBackground != null
            ? {
                backgroundImage: `url(${hoverBackground})`,
                backgroundSize: '200% 200%',
                backgroundPosition: 'center'
              }
            : undefined
        }
        aria-hidden="true"
      />
      <div
        className={
          'absolute inset-0 z-0 bg-linear-to-tr from-purple-950/10 via-purple-950/10 to-stone-950/90 mix-blend-multiply'
        }
      />

      <div className="absolute inset-0 bg-[url(/assets/overlay.svg)] bg-repeat opacity-70 mix-blend-multiply" />
      {hasHeaderContent(
        subtitle,
        title,
        ctaHref,
        ctaLabel,
        subtitleOverride,
        titleOverride,
        ctaHrefOverride,
        ctaLabelOverride
      ) && (
        <div className="padded relative z-2 pb-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1">
              {!isValueDisabled(subtitleOverride) &&
                subtitle != null &&
                subtitle !== '' && (
                  <h4
                    className="text-sm font-semibold tracking-wider text-red-100/70 uppercase xl:text-base 2xl:text-lg"
                    data-testid="SectionVideoGridSubtitle"
                  >
                    {subtitle}
                  </h4>
                )}
              {!isValueDisabled(titleOverride) &&
                title != null &&
                title !== '' && (
                  <h2
                    className="text-2xl font-bold xl:text-3xl 2xl:text-4xl"
                    data-testid="SectionVideoGridTitle"
                  >
                    {title}
                  </h2>
                )}
            </div>
            {!isValueDisabled(ctaHrefOverride) &&
              !isValueDisabled(ctaLabelOverride) &&
              ctaHref != null &&
              ctaHref !== '' &&
              ctaLabel != null &&
              ctaLabel !== '' && (
                <NextLink href={ctaHref} data-analytics-tag={analyticsTag}>
                  <button
                    aria-label={ctaLabel}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-wider text-black uppercase transition-colors duration-200 hover:bg-red-500 hover:text-white"
                    data-testid="SectionVideoGridCTA"
                  >
                    <Icon
                      name={watchButtonIcon}
                      sx={{
                        width: 16,
                        height: 16
                      }}
                      data-testid="SectionVideoGridCTAIcon"
                    />
                    <span>{ctaLabel}</span>
                  </button>
                </NextLink>
              )}
          </div>
        </div>
      )}

      <div className="padded relative">
        <VideoGrid
          videos={videos}
          loading={loading}
          orientation={orientation}
          hasNoResults={hasNoResults}
          analyticsTag={analyticsTag}
          showSequenceNumbers={showSequenceNumbers}
          onCardHoverChange={handleCardHoverChange}
          containerSlugMap={containerSlugMap}
          data-testid="SectionVideoGridContainer"
        />
      </div>

      {!isValueDisabled(descriptionOverride) &&
        description != null &&
        description !== '' && (
          <div className="padded relative z-1 space-y-6">
            <p
              className="mt-8 text-lg leading-relaxed text-stone-200/80 xl:text-xl"
              data-testid="SectionVideoGridDescription"
            >
              {description}
            </p>
          </div>
        )}
    </section>
  )
}
