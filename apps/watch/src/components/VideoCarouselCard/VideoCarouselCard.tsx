import last from 'lodash/last'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, memo, useState } from 'react'

import Play3 from '@core/shared/ui/icons/Play3'

import { blurImage, useBlurhash } from '../../libs/blurhash'
import { useThrottledPlayerProgress } from '../../libs/playerContext'
import { useThumbnailUrl } from '../../libs/thumbnail'
import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'
import { getWatchUrl } from '../../libs/utils/getWatchUrl'
import { useWatch } from '../../libs/watchContext'
import { UnifiedCardData } from '../../types/inserts'

interface VideoCarouselCardProps {
  data: UnifiedCardData
  containerSlug?: string
  active: boolean
  transparent?: boolean
  onVideoSelect?: (videoId: string) => void
}

interface CardContentProps {
  data: UnifiedCardData
  active: boolean
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  label: string
  playerProgress: number
  interactive?: boolean
  orientation?: 'horizontal' | 'vertical'
  containerSlug?: string
}

const CardContent = memo(function CardContent({
  data,
  active,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  label,
  playerProgress,
  interactive = false,
  orientation = 'horizontal',
  containerSlug
}: CardContentProps): ReactElement {
  const { state: watchState } = useWatch()

  // Compute safe image src and alt with proper guards
  const imageSrc = data.images?.[0]?.mobileCinematicHigh
  const imageAlt = data.imageAlt?.[0]?.value ?? ''

  // Get thumbnail URL (local override or original) with enhanced specificity
  const { thumbnailUrl } = useThumbnailUrl(data.id, imageSrc, {
    orientation,
    containerSlug,
    variantSlug: data.variant?.slug,
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
  const blurDataURL = blurhash
    ? blurImage(blurhash, dominantColor ?? '#000000')
    : undefined

  const ContainerElement = interactive ? 'button' : 'div'
  const ContentElement = interactive ? 'div' : 'div'

  return (
    <div className="flex h-full min-h-full w-full flex-grow flex-col">
      <ContainerElement
        data-testid={`VideoCardButton-${data.slug}`}
        {...(interactive && {
          name:
            typeof data.title === 'string'
              ? data.title
              : last(data.title)?.value,
          disabled: data == null
        })}
        className="beveled relative h-full w-full cursor-pointer rounded-lg border-none bg-transparent p-0 text-left disabled:cursor-default"
      >
        <ContentElement
          className="relative flex h-full w-full cursor-pointer flex-col justify-end overflow-hidden rounded-xl bg-black"
          {...(interactive && {
            tabIndex: 0,
            role: 'button',
            'aria-label': `Navigate to ${data.slug}`
          })}
          data-testid={`CarouselItem-${data.slug}`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {/* Image Layer with Lazy Loading - Only render when thumbnailUrl is available */}
          <div className="absolute top-0 right-0 bottom-0 left-0 overflow-hidden rounded-lg">
            {thumbnailUrl && (
              <Image
                fill
                src={thumbnailUrl}
                alt={imageAlt}
                priority={active}
                style={{
                  width: '100%',
                  objectFit: 'cover',
                  maskSize: 'cover',
                  pointerEvents: 'none'
                }}
                {...(blurDataURL != null
                  ? { placeholder: 'blur' as const, blurDataURL }
                  : {})}
              />
            )}
          </div>

          {/* Active/Hover Border Layer */}
          <div
            className={`pointer-events-none absolute top-0 right-0 bottom-0 left-0 overflow-visible rounded-lg transition-all duration-100 ease-in-out ${
              active || isHovered ? 'shadow-[inset_0_0_0_4px_#fff]' : ''
            }`}
            data-testid="ActiveLayer"
          />

          {/* Progress Bar Overlay */}
          {active && playerProgress >= 5 && (
            <div
              className="pointer-events-none absolute top-0 bottom-0 left-0 bg-stone-100/30 mix-blend-hard-light will-change-transform"
              style={{
                width: '100%',
                transform: `scale3d(${playerProgress / 100}, 1, 1)`,
                transformOrigin: 'left center'
              }}
              data-testid="ProgressOverlay"
            />
          )}

          {/* Play Button with Fade */}
          <div
            className={`bg-opacity-50 absolute top-1/2 right-1/2 z-2 flex h-20 w-20 translate-x-1/2 -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full bg-red-500 text-white transition-all duration-300 ${
              !active && isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              pointerEvents: 'none'
            }}
          >
            <Play3 className="text-6xl" />
          </div>

          {/* Content */}
          <div className="z-1 p-4 font-sans">
            <span
              className="text-xs font-bold tracking-widest text-stone-100/80 uppercase"
              data-testid="CarouselItemCategory"
            >
              {label}
            </span>
            <h3
              className="overflow-hidden text-base leading-tight font-bold text-stone-50 text-shadow-xs"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}
              data-testid={`CarouselItemTitle-${data.slug}`}
            >
              {typeof data.title === 'string'
                ? data.title
                : last(data.title)?.value}
            </h3>
          </div>
        </ContentElement>
      </ContainerElement>
    </div>
  )
})

export function VideoCarouselCard({
  data,
  containerSlug,
  active,
  transparent = false,
  onVideoSelect
}: VideoCarouselCardProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { label } = getLabelDetails(t, data.label)
  const href = getWatchUrl(containerSlug, data.label, data.variant?.slug)
  const [isHovered, setIsHovered] = useState(false)
  // Always call the hook to maintain hook order, but only use progress for active cards
  // Throttle updates to ~10fps for smooth animation without excessive re-renders
  const playerProgressRaw = useThrottledPlayerProgress(100)
  const playerProgress = active ? playerProgressRaw : 0

  const handleVideoSelect = (e: React.MouseEvent) => {
    if (onVideoSelect) {
      e.preventDefault()
      onVideoSelect(data.id)
    }
  }

  const cardContent = (
    <CardContent
      data={data}
      active={active}
      isHovered={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      label={label}
      playerProgress={playerProgress}
      interactive={!!onVideoSelect}
      orientation="horizontal"
      containerSlug={containerSlug}
    />
  )

  const commonProps = {
    className: `block beveled h-full min-h-full w-full no-underline text-inherit ${
      transparent ? 'opacity-70' : ''
    } cursor-pointer`,
    'aria-label':
      (typeof data.title === 'string' ? data.title : last(data.title)?.value) ??
      `Video ${data.slug}`,
    'data-testid': `VideoCard-${data.id}`
  }

  // Home page: render with click handler
  if (onVideoSelect) {
    return (
      <div
        {...commonProps}
        className={commonProps.className}
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
