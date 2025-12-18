import last from 'lodash/last'
import { Play } from 'lucide-react'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import type { MouseEvent, ReactElement } from 'react'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { VideoLabel } from '../../../__generated__/globalTypes'
import type { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { blurImage, useBlurhash } from '../../libs/blurhash'
import { useThumbnailUrl } from '../../libs/thumbnail'
import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'
import { useWatch } from '../../libs/watchContext'
import type { CarouselVideo } from '../VideoHero/libs/useCarouselVideos'

interface VideoCardProps {
  video?: VideoChildFields | CarouselVideo
  orientation?: 'horizontal' | 'vertical'
  containerSlug?: string
  index?: number
  active?: boolean
  imageClassName?: string
  onClick?: (videoId?: string) => (event: MouseEvent) => void
  analyticsTag?: string
  showSequenceNumber?: boolean
  onHoverImageChange?: (
    data?: { imageUrl: string; blurhash: string; dominantColor: string } | null
  ) => void
  variant?: string
}

export function getSlug(
  containerSlug: string | undefined,
  label: VideoLabel | undefined,
  variantSlug: string | undefined
): string {
  if (
    containerSlug != null &&
    label !== undefined &&
    ![VideoLabel.collection, VideoLabel.series].includes(label)
  ) {
    return `/${containerSlug}.html/${variantSlug ?? ''}.html`
  } else {
    const [videoId, languageId] = (variantSlug ?? '').split('/')
    return `/${videoId}.html/${languageId}.html`
  }
}

export function VideoCard({
  video,
  orientation = 'horizontal',
  containerSlug,
  index,
  active,
  imageClassName,
  onClick: handleClick,
  analyticsTag,
  showSequenceNumber = false,
  onHoverImageChange
}: VideoCardProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { state: watchState } = useWatch()

  const { label, childCountLabel } = getLabelDetails(
    t,
    video?.label as VideoLabel | undefined,
    video?.childrenCount ?? 0
  )
  const href = getSlug(
    containerSlug,
    video?.label as VideoLabel | undefined,
    video?.variant?.slug
  )

  // Compute safe image src and alt with proper guards
  const imageSrc = last(video?.images)?.mobileCinematicHigh
  const imageAlt = last(video?.imageAlt)?.value ?? ''
  const sequenceLabel = showSequenceNumber && index != null ? index + 1 : null

  // Get thumbnail URL (local override or original) with enhanced specificity
  const { thumbnailUrl } = useThumbnailUrl(video?.id, imageSrc, {
    orientation,
    containerSlug,
    variantSlug: video?.variant?.slug,
    languageId: watchState.audioLanguageId
  })

  // Generate blurhash from the actual image that will be displayed
  // Use thumbnailUrl if it's different from imageSrc (indicating local thumbnail)
  // Otherwise use original imageSrc for blurhash generation
  // Strip query parameters for local thumbnails since blurhash API reads from disk
  const blurhashImageUrl =
    thumbnailUrl != null && thumbnailUrl !== imageSrc
      ? thumbnailUrl.split('?')[0] // Remove cache-busting parameters for blurhash generation
      : imageSrc
  const { blurhash, dominantColor } = useBlurhash(blurhashImageUrl)
  const blurDataURL =
    blurhash != null
      ? blurImage(blurhash, dominantColor ?? '#000000')
      : undefined

  return (
    <NextLink
      href={href}
      className={`block text-inherit no-underline ${
        video != null
          ? 'pointer-events-auto cursor-pointer'
          : 'pointer-events-none'
      }`}
      aria-label="VideoCard"
      data-testid={video != null ? `VideoCard-${video.id}` : 'VideoCard'}
      data-analytics-tag={analyticsTag}
      onClick={handleClick?.(video?.id)}
    >
      <div className="flex flex-col gap-6">
        <button
          type="button"
          disabled={video == null}
          className={`group relative overflow-hidden rounded-lg ${orientation === 'vertical' ? 'aspect-[2/3]' : 'aspect-video'} beveled transition-transform duration-300 hover:scale-102 focus-visible:scale-102 ${imageClassName || ''} cursor-pointer disabled:cursor-default`}
          onMouseEnter={() => {
            if (imageSrc && blurhash && dominantColor) {
              onHoverImageChange?.({
                imageUrl: imageSrc,
                blurhash,
                dominantColor
              })
            } else if (imageSrc) {
              onHoverImageChange?.({
                imageUrl: imageSrc,
                blurhash: '',
                dominantColor: '#000000'
              })
            }
          }}
          onMouseLeave={() => onHoverImageChange?.(null)}
        >
          {sequenceLabel != null && (
            <span
              className="absolute top-2 left-2 z-10 text-[48px] leading-none font-bold text-stone-100/90 text-shadow-lg"
              aria-hidden="true"
              data-testid="VideoCardSequenceNumber"
            >
              {sequenceLabel}
            </span>
          )}
          <div className="absolute inset-0 overflow-hidden rounded-lg bg-black/50 transition-transform duration-300">
            {/* Blurhash Layer */}
            {blurDataURL && (
              <div
                className="absolute inset-0 rounded-lg"
                style={{
                  backgroundImage: `url(${blurDataURL})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'left top',
                  filter: 'brightness(0.85)'
                }}
                data-testid="VideoCardBlurhash"
              />
            )}
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={imageAlt}
                fill
                sizes="100vw"
                className="poster-hover-zoom"
                data-content-id={video?.id}
                {...(blurDataURL != null
                  ? { placeholder: 'blur' as const, blurDataURL }
                  : {})}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'left top',
                  maskImage:
                    'linear-gradient(to top, transparent 0%,  rgba(0,0,0,.4) 30% ,black 42%)',
                  WebkitMaskImage:
                    'linear-gradient(to top, transparent 0%,  rgba(0,0,0,.4) 30% ,black 42%)'
                }}
              />
            ) : (
              <div className="aspect-video">
                <div
                  className="h-full w-full animate-pulse bg-gray-300"
                  data-testid="VideoImageSkeleton"
                />
              </div>
            )}
          </div>
          <div className="gradient-contained absolute inset-0 rounded-lg opacity-15 shadow-[inset_0px_0px_0px_1px_rgba(255,255,255,0.12)] transition-opacity duration-300 hover:opacity-50" />
          {/* Duration/Chapters Indicator - Top Right */}
          <div
            className={`absolute top-2 right-2 z-10 flex flex-shrink-0 flex-row items-center gap-1 rounded px-2 py-1 text-white ${
              active === true ? 'bg-primary' : 'bg-black/30'
            }`}
          >
            {active === true ? (
              <>
                <Play className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  {t('Playing now')}
                </span>
              </>
            ) : (
              <>
                {video == null && (
                  <>
                    <Play className="h-4 w-4" />
                    <div
                      className="h-4 w-5 animate-pulse bg-gray-400"
                      data-testid="VideoVariantDurationSkeleton"
                    />
                  </>
                )}
                {video?.childrenCount === 0 && (
                  <>
                    <Play className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      {secondsToTimeFormat(video?.variant?.duration ?? 0, {
                        trimZeroes: true
                      })}
                    </span>
                  </>
                )}
                {(video?.childrenCount ?? 0) > 0 && (
                  <span className="text-sm font-semibold">
                    {childCountLabel.toLowerCase()}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="absolute inset-0 flex flex-col justify-end gap-0 p-4">
            <div className="flex min-w-0 flex-row items-end justify-between gap-90">
              <div className="truncate text-xs leading-8 font-semibold tracking-wider text-stone-300/70 uppercase mix-blend-screen">
                {video != null ? (
                  label
                ) : (
                  <div
                    className="h-4 w-12 animate-pulse bg-gray-400"
                    data-testid="VideoLabelSkeleton"
                  />
                )}
              </div>
            </div>
            <h3 className="text-shadow-light -mt-1 text-left text-xl leading-tight font-bold text-white">
              {video != null ? (
                last(video?.title)?.value
              ) : (
                <div
                  className="h-5 w-3/5 animate-pulse bg-gray-400"
                  data-testid="VideoTitleSkeleton"
                />
              )}
            </h3>
          </div>
        </button>
      </div>
    </NextLink>
  )
}
