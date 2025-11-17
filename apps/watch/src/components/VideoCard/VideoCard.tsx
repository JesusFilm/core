import last from 'lodash/last'
import { Play } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import type { MouseEvent, ReactElement } from 'react'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { VideoLabel } from '../../../__generated__/globalTypes'
import type { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'
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
  onHoverImageChange?: (imageUrl?: string | null) => void
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
    return `/watch/${containerSlug}.html/${variantSlug ?? ''}.html`
  } else {
    const [videoId, languageId] = (variantSlug ?? '').split('/')
    return `/watch/${videoId}.html/${languageId}.html`
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

  const { label, color, childCountLabel } = getLabelDetails(
    t,
    video?.label,
    video?.childrenCount ?? 0
  )
  const href = getSlug(containerSlug, video?.label, video?.variant?.slug)

  // Compute safe image src and alt with proper guards
  const imageSrc = last(video?.images)?.mobileCinematicHigh
  const imageAlt = last(video?.imageAlt)?.value ?? ''
  const sequenceLabel = showSequenceNumber && index != null ? index + 1 : null

  return (
    <a
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
          onMouseEnter={() => onHoverImageChange?.(imageSrc)}
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
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="100vw"
                className="poster-hover-zoom"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'left top'
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
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <h3 className="text-shadow-strong text-left text-xl leading-tight font-bold text-white">
              {video != null ? (
                last(video?.title)?.value
              ) : (
                <div
                  className="h-5 w-3/5 animate-pulse bg-gray-400"
                  data-testid="VideoTitleSkeleton"
                />
              )}
            </h3>
            <div className="flex min-w-0 flex-row items-end justify-between gap-2">
              <div
                className={`truncate text-xs leading-8 tracking-wider uppercase ${
                  color === 'primary.main'
                    ? 'text-primary'
                    : color === 'secondary.main'
                      ? 'text-secondary'
                      : 'text-gray-600'
                }`}
              >
                {video != null ? (
                  label
                ) : (
                  <div
                    className="h-4 w-12 animate-pulse bg-gray-400"
                    data-testid="VideoLabelSkeleton"
                  />
                )}
              </div>

              <div
                className={`flex h-7 flex-shrink-0 flex-row items-center gap-1 rounded p-2 text-white ${
                  active === true ? 'bg-primary' : 'bg-black/50'
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
            </div>
          </div>
        </button>
      </div>
    </a>
  )
}
