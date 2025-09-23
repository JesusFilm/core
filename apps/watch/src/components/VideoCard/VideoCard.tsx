import { Play, Plus } from 'lucide-react'
import last from 'lodash/last'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import type { MouseEvent, ReactElement } from 'react'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { VideoLabel } from '../../../__generated__/globalTypes'
import type { VideoChildFields } from '../../../__generated__/VideoChildFields'
import type { CarouselVideo } from '../VideoHero/libs/useCarouselVideos'
import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'

interface VideoCardProps {
  video?: VideoChildFields | CarouselVideo
  variant?: 'contained' | 'expanded'
  containerSlug?: string
  index?: number
  active?: boolean
  imageClassName?: string
  onClick?: (videoId?: string) => (event: MouseEvent) => void
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
  containerSlug,
  variant = 'expanded',
  index,
  active,
  imageClassName,
  onClick: handleClick
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

  return (
    <a
      href={href}
      className={`block no-underline text-inherit ${video != null ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-label="VideoCard"
      data-testid={video != null ? `VideoCard-${video.id}` : 'VideoCard'}
      onClick={handleClick?.(video?.id)}
    >
      <div className="flex flex-col gap-6">
        <button
          disabled={video == null}
          className={`relative w-full overflow-hidden rounded-lg aspect-video hover:scale-102 focus-visible:scale-102 transition-transform duration-300 ${imageClassName || ''}`}
        >
          <div
            className="absolute inset-0 rounded-lg overflow-hidden bg-black/50 transition-transform duration-300"
          >
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="100vw"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'left top'
                }}
              />
            ) : (
              <div className="aspect-video">
                <div
                  className="w-full h-full bg-gray-300 animate-pulse"
                  data-testid="VideoImageSkeleton"
                />
              </div>
            )}
          </div>
          {variant === 'contained' && (
            <div
              className="absolute inset-0 rounded-lg gradient-contained transition-opacity duration-300 opacity-15 hover:opacity-50 shadow-[inset_0px_0px_0px_1px_rgba(255,255,255,0.12)]"
            />
          )}
          {variant === 'expanded' && (
            <div
              className="absolute inset-0 rounded-lg gradient-expanded transition-opacity duration-300 opacity-15 hover:opacity-50"
            />
          )}
          <div
            className={`absolute inset-0 flex flex-col justify-end ${variant === 'contained' ? 'p-4' : 'p-1'}`}
          >
            {variant === 'contained' && (
              <h3
                className="text-xl font-bold text-white leading-tight text-left text-shadow-strong"
              >
                {video != null ? (
                  last(video?.title)?.value
                ) : (
                  <div className="w-3/5 h-5 bg-gray-400 animate-pulse" data-testid="VideoTitleSkeleton" />
                )}
              </h3>
            )}
            <div
              className="flex flex-row justify-between items-end min-w-0 gap-2"
            >
              <p
                className={`text-xs uppercase tracking-wider truncate leading-8 ${
                  color === 'primary.main' ? 'text-primary' :
                  color === 'secondary.main' ? 'text-secondary' :
                  'text-gray-600'
                }`}
              >
                {variant === 'contained' &&
                  (video != null ? (
                    label
                  ) : (
                    <div className="w-12 h-4 bg-gray-400 animate-pulse" data-testid="VideoLabelSkeleton" />
                  ))}
              </p>

              <div
                className={`flex flex-row items-center gap-1 p-2 rounded h-7 text-white flex-shrink-0 ${
                  active === true ? 'bg-primary' : 'bg-black/50'
                }`}
              >
                {active === true ? (
                  <>
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-semibold">{t('Playing now')}</span>
                  </>
                ) : (
                  <>
                    {video == null && (
                      <>
                        <Play className="w-4 h-4" />
                        <div className="w-5 h-4 bg-gray-400 animate-pulse" data-testid="VideoVariantDurationSkeleton" />
                      </>
                    )}
                    {video?.childrenCount === 0 && (
                      <>
                        <Play className="w-4 h-4" />
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
        {variant === 'expanded' && (
          <div>
            {index != null && (
              <p className="text-xs uppercase tracking-wider opacity-50">
                {video != null ? (
                  `${label} ${
                    video.label === VideoLabel.episode ||
                    video.label === VideoLabel.segment
                      ? index + 1
                      : ''
                  }`.trim()
                ) : (
                  <div className="w-1/5 h-4 bg-gray-400 animate-pulse" data-testid="VideoLabelIndexSkeleton" />
                )}
              </p>
            )}
            <h3
              className="text-text-primary text-xl font-bold leading-tight"
            >
              {video?.title != null ? (
                last(video?.title)?.value
              ) : (
                <div className="w-3/5 h-5 bg-gray-400 animate-pulse" data-testid="VideoTitleSkeleton" />
              )}
            </h3>
          </div>
        )}
      </div>
    </a>
  )
}
