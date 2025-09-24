import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'

import { Icon } from '@core/shared/ui/icons/Icon'

import { cn } from '../../libs/cn'
import {
  SectionVideoCollectionCarouselSource,
  SectionVideoCollectionCarouselSlide,
  useSectionVideoCollectionCarouselContent
} from '../SectionVideoCarousel/useSectionVideoCollectionCarouselContent'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import type { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VideoLabel } from '../../../__generated__/globalTypes'

export type { SectionVideoCollectionCarouselSource as SectionVideoGridSource } from '../SectionVideoCarousel/useSectionVideoCollectionCarouselContent'

interface TransformSlidesResult {
  videos: VideoChildFields[]
  containerSlugByVideoId: Record<string, string | undefined>
}

function removeHtmlExtension(segment: string | undefined): string | undefined {
  if (segment == null) return undefined
  return segment.replace(/\.html$/i, '')
}

function parseWatchHref(
  href: string
): {
  containerSlug?: string
  videoSlug?: string
  variantSlug?: string
} {
  const [rawPath] = href.split('?')
  if (rawPath == null) return {}

  const normalized = rawPath.replace(/^\//, '')
  if (!normalized.startsWith('watch')) return {}

  const remainder = normalized.slice('watch'.length)
  const trimmed = remainder.replace(/^\//, '')
  const segments = trimmed.split('/').filter((segment) => segment.length > 0)
  if (segments.length === 0) return {}

  let containerSlug: string | undefined
  let variantSegments = segments

  if (segments.length > 2) {
    containerSlug = removeHtmlExtension(segments[0])
    variantSegments = segments.slice(1)
  }

  const cleanedVariantSegments = variantSegments
    .map((segment) => removeHtmlExtension(segment))
    .filter((segment): segment is string => segment != null && segment !== '')

  if (cleanedVariantSegments.length === 0) {
    return { containerSlug }
  }

  const videoSlug = cleanedVariantSegments[0]
  const languageSegment = cleanedVariantSegments[1]
  const variantSlug =
    languageSegment != null
      ? `${videoSlug}/${languageSegment}`
      : videoSlug

  return { containerSlug, videoSlug, variantSlug }
}

// Transform SectionVideoCollectionCarouselSlide to VideoChildFields-compatible format
function transformSlidesToVideoChildFields(
  slides: SectionVideoCollectionCarouselSlide[]
): TransformSlidesResult {
  return slides.reduce<TransformSlidesResult>(
    (acc, slide) => {
      const { containerSlug, videoSlug, variantSlug } = parseWatchHref(slide.href)

      if (containerSlug != null) {
        acc.containerSlugByVideoId[slide.id] = containerSlug
      }

      acc.videos.push({
        __typename: 'Video' as const,
        id: slide.id,
        label: slide.label ?? VideoLabel.shortFilm,
        title: [{ __typename: 'VideoTitle' as const, value: slide.title }],
        images: [
          {
            __typename: 'CloudflareImage' as const,
            mobileCinematicHigh: slide.imageUrl
          }
        ],
        imageAlt: [{ __typename: 'VideoImageAlt' as const, value: slide.alt }],
        snippet: slide.snippet
          ? [{ __typename: 'VideoSnippet' as const, value: slide.snippet }]
          : [],
        slug: videoSlug ?? slide.id,
        variant:
          variantSlug != null
            ? {
                __typename: 'VideoVariant' as const,
                id: `${slide.id}-variant`,
                duration: 0,
                hls: null,
                slug: variantSlug
              }
            : null,
        childrenCount: 0
      })

      return acc
    },
    { videos: [], containerSlugByVideoId: {} }
  )
}

export interface SectionVideoGridProps {
  id?: string
  sources: SectionVideoGridSource[]
  primaryCollectionId?: string
  subtitleOverride?: string
  titleOverride?: string
  descriptionOverride?: string
  ctaLabelOverride?: string
  ctaHrefOverride?: string
  watchButtonIcon?: 'Play3' | 'ArrowRight'
  analyticsTag?: string
  backgroundClassName?: string
  orientation?: 'horizontal' | 'vertical'
  languageId?: string
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
  languageId
}: SectionVideoGridProps): ReactElement | null {
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

  // Transform slides to VideoChildFields format for VideoGrid
  const { videos, containerSlugByVideoId } = useMemo(
    () => transformSlidesToVideoChildFields(slides),
    [slides]
  )

  if (!loading && slides.length === 0) return null

  return (
    <section
      id={id}
      className={cn(
        'relative bg-linear-to-tr from-blue-950/10 via-purple-950/10 to-[#91214A]/90 py-16 scroll-snap-start-always',
        backgroundClassName
      )}
      data-testid="SectionVideoGrid"
    >
      <div className="absolute inset-0 bg-[url(/watch/assets/overlay.svg)] bg-repeat mix-blend-multiply" />
      <div className="padded relative z-2 pb-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            {subtitle != null && subtitle !== '' && (
              <h4
                className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70"
                data-testid="SectionVideoGridSubtitle"
              >
                {subtitle}
              </h4>
            )}
            {title != null && title !== '' && (
              <h2
                className="text-2xl xl:text-3xl 2xl:text-4xl font-bold"
                data-testid="SectionVideoGridTitle"
              >
                {title}
              </h2>
            )}
          </div>
          <a href={ctaHref} data-analytics-tag={analyticsTag}>
            <button
              aria-label={ctaLabel}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs text-black font-bold uppercase tracking-wider rounded-full bg-white hover:bg-red-500 hover:text-white transition-colors duration-200 cursor-pointer"
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
        </div>
      </div>

      <div className="padded relative">
        <VideoGrid
          videos={videos}
          loading={loading}
          orientation={orientation}
          analyticsTag={analyticsTag}
          containerSlugByVideoId={containerSlugByVideoId}
          data-testid="SectionVideoGridContainer"
        />
      </div>

      <div className="padded space-y-6">
        {description != null && description !== '' && (
          <p className="text-lg xl:text-xl mt-8 leading-relaxed text-stone-200/80" data-testid="SectionVideoGridDescription">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
