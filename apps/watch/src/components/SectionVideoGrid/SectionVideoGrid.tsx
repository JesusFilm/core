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
import { cn } from '@core/shared/uimodern/utils'

import {
  SectionVideoCollectionCarouselSource,
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
  limitChildren = 12
}: SectionVideoGridProps): ReactElement | null {
  const { t } = useTranslation('apps-watch')

  const resolvedSources = useMemo(() => {
    if (sources != null) return sources
    if (primaryCollectionId != null) {
      return [{ type: 'collection', id: primaryCollectionId, limitChildren }]
    }
    return []
  }, [sources, primaryCollectionId, limitChildren])

  const { loading, slides, subtitle, title, description, ctaHref, ctaLabel } =
    useSectionVideoCollectionCarouselContent({
      sources: resolvedSources,
      primaryCollectionId,
      subtitleOverride: subtitleOverride || undefined,
      titleOverride: titleOverride || undefined,
      descriptionOverride: descriptionOverride || undefined,
      ctaLabelOverride: ctaLabelOverride || undefined,
      ctaHrefOverride,
      defaultCtaLabel: t('Watch'),
      languageId
    })

  const videos = useMemo(() => slides.map((slide) => slide.video), [slides])

  const [hoverBackground, setHoverBackground] = useState<string | null>(null)
  const [isBackgroundVisible, setIsBackgroundVisible] = useState(false)
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    (imageUrl?: string | null) => {
      clearTimers()

      if (imageUrl == null || imageUrl === '') {
        setIsBackgroundVisible(false)
        hideTimeoutRef.current = setTimeout(() => {
          setHoverBackground(null)
        }, 200)
        return
      }

      setIsBackgroundVisible(false)

      showTimeoutRef.current = setTimeout(() => {
        setHoverBackground(imageUrl)
        setIsBackgroundVisible(true)
      }, 40)
    },
    [clearTimers]
  )

  useEffect(() => () => clearTimers(), [clearTimers])

  if (!loading && slides.length === 0) return null

  return (
    <section
      id={id}
      className={cn(
        'scroll-snap-start-always relative bg-linear-to-tr from-blue-950/10 via-purple-950/10 to-[#91214A]/90 py-16',
        backgroundClassName
      )}
      data-testid="SectionVideoGrid"
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
      <div className="absolute inset-0 bg-[url(/watch/assets/overlay.svg)] bg-repeat mix-blend-multiply" />
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
                <a href={ctaHref} data-analytics-tag={analyticsTag}>
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
                </a>
              )}
          </div>
        </div>
      )}

      <div className="padded relative">
        <VideoGrid
          videos={videos}
          loading={loading}
          orientation={orientation}
          analyticsTag={analyticsTag}
          showSequenceNumbers={showSequenceNumbers}
          onCardHoverChange={handleCardHoverChange}
          data-testid="SectionVideoGridContainer"
        />
      </div>

      {!isValueDisabled(descriptionOverride) &&
        description != null &&
        description !== '' && (
          <div className="padded space-y-6">
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
