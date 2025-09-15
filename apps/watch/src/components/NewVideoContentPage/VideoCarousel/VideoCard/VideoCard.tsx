import last from 'lodash/last'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Play3 from '@core/shared/ui/icons/Play3'

import { LazyImage } from './LazyImage'

import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'
import { getLabelDetails } from '../../../../libs/utils/getLabelDetails/getLabelDetails'
import { getWatchUrl } from '../../../../libs/utils/getWatchUrl'
import { usePlayer } from '../../../../libs/playerContext'

interface VideoCardProps {
  video: VideoChildFields
  containerSlug?: string
  active: boolean
  transparent?: boolean
  onVideoSelect?: (videoId: string) => void
}

interface CardContentProps {
  video: VideoChildFields
  active: boolean
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  label: string
  playerProgress: number
  interactive?: boolean
}

function CardContent({
  video,
  active,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  label,
  playerProgress,
  interactive = false
}: CardContentProps): ReactElement {
  // Compute safe image src and alt with proper guards
  const imageSrc = video.images?.[0]?.mobileCinematicHigh
  const imageAlt = video.imageAlt?.[0]?.value ?? ''

  const ContainerElement = interactive ? 'button' : 'div'
  const ContentElement = interactive ? 'div' : 'div'

  return (
    <div className="flex flex-col gap-6">
      <ContainerElement
        data-testid={`VideoCardButton-${video.slug}`}
        {...(interactive && {
          name: last(video.title)?.value,
          disabled: video == null
        })}
        className="beveled rounded-lg w-full relative text-left border-none bg-transparent p-0 cursor-pointer disabled:cursor-default"
      >
        <ContentElement
          className="relative max-w-[200px] h-60 flex flex-col justify-end w-full rounded-xl cursor-pointer bg-black"
          {...(interactive && {
            tabIndex: 0,
            role: 'button',
            'aria-label': `Navigate to ${video.slug}`
          })}
          data-testid={`CarouselItem-${video.slug}`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {/* Image Layer with Lazy Loading - Only render when imageSrc is available */}
          <div className="absolute left-0 right-0 top-0 bottom-0 rounded-lg overflow-hidden">
            {imageSrc && (
              <Image
                fill
                src={imageSrc}
                alt={imageAlt}
                priority={active}
                style={{
                  width: '100%',
                  objectFit: 'cover',
                  maskSize: 'cover',
                  pointerEvents: 'none'
                }}
              />
            )}
          </div>

          {/* Active/Hover Border Layer */}
          <div
            className={`absolute left-0 right-0 top-0 bottom-0 rounded-lg overflow-visible transition-all duration-100 ease-in-out pointer-events-none ${
              active || isHovered ? 'shadow-[inset_0_0_0_4px_#fff]' : ''
            }`}
            data-testid="ActiveLayer"
          />

          {/* Progress Bar Overlay */}
          {active && playerProgress >= 5 && (
            <div
              className="absolute left-0 top-0 bottom-0 bg-stone-100/30 rounded-l-lg pointer-events-none mix-blend-hard-light transition-[width] duration-1200 ease-linear"
              style={{ width: `${playerProgress}%` }}
              data-testid="ProgressOverlay"
            />
          )}

          {/* Play Button with Fade */}
          <div
            className={`absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-20 h-20 flex items-center justify-center text-white bg-red-500 bg-opacity-50 rounded-full transition-all duration-300 cursor-pointer z-2 ${
              !active && isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              pointerEvents: 'none'
            }}
          >
            <Play3 className="text-6xl" />
          </div>

          {/* Content */}
          <div className="p-4 font-sans z-1">
            <span
              className="text-stone-100/80 text-xs font-bold tracking-widest uppercase"
              data-testid="CarouselItemCategory"
            >
              {label}
            </span>
            <h3
              className="font-bold text-base text-stone-50 leading-tight overflow-hidden text-shadow-xs"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}
              data-testid={`CarouselItemTitle-${video.slug}`}
            >
              {last(video.title)?.value}
            </h3>
          </div>
        </ContentElement>
      </ContainerElement>
    </div>
  )
}

export function VideoCard({
  video,
  containerSlug,
  active,
  transparent = false,
  onVideoSelect
}: VideoCardProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { label } = getLabelDetails(t, video.label)
  const href = getWatchUrl(containerSlug, video.label, video.variant?.slug)
  const [isHovered, setIsHovered] = useState(false)
  const { state: playerState } = usePlayer()

  const handleVideoSelect = (e: React.MouseEvent) => {
    if (onVideoSelect) {
      e.preventDefault()
      onVideoSelect(video.id)
    }
  }

  const cardContent = (
    <CardContent
      video={video}
      active={active}
      isHovered={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      label={label}
      playerProgress={playerState.progress}
      interactive={!!onVideoSelect}
    />
  )

  const commonProps = {
    className: `block beveled no-underline text-inherit ${transparent ? 'opacity-70' : ''}`,
    'aria-label': last(video.title)?.value ?? `Video ${video.slug}`,
    'data-testid': `VideoCard-${video.id}`
  }

  // Home page: render with click handler
  if (onVideoSelect) {
    return (
      <div
        {...commonProps}
        className={`${commonProps.className} cursor-pointer`}
        role="button"
        tabIndex={0}
        onClick={handleVideoSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleVideoSelect(e as unknown as React.MouseEvent)
          }
        }}
      >
        {cardContent}
      </div>
    )
  }

  // Single video page: render with NextLink for navigation
  return (
    <NextLink href={href} scroll={false} locale={false} {...commonProps}>
      {cardContent}
    </NextLink>
  )
}
