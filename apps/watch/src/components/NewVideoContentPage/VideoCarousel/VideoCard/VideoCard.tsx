import last from 'lodash/last'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Play3 from '@core/shared/ui/icons/Play3'

import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'
import { usePlayer } from '../../../../libs/playerContext'
import { getLabelDetails } from '../../../../libs/utils/getLabelDetails/getLabelDetails'
import { getWatchUrl } from '../../../../libs/utils/getWatchUrl'
import { UnifiedCardData } from '../../../../types/inserts'

interface VideoCardProps {
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
}

function CardContent({
  data,
  active,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  label,
  playerProgress,
  interactive = false
}: CardContentProps): ReactElement {
  // Compute safe image src and alt with proper guards
  const imageSrc = data.images?.[0]?.mobileCinematicHigh
  const imageAlt = data.imageAlt?.[0]?.value ?? ''

  const ContainerElement = interactive ? 'button' : 'div'

  return (
    <div className="flex flex-col gap-6">
      <ContainerElement
        data-testid={`VideoCardButton-${data.slug}`}
        {...(interactive && {
          type: 'button' as const,
          name: typeof data.title === 'string' ? data.title : last(data.title)?.value,
          disabled: data == null
        })}
        className="beveled w-full max-w-[520px] border-none bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-default"
        onFocus={() => onMouseEnter()}
        onBlur={() => onMouseLeave()}
      >
        <div
          className="group relative flex w-full items-stretch gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition-transform duration-200 ease-out hover:-translate-y-0.5"
          {...(interactive && {
            role: 'button',
            tabIndex: -1,
            'aria-label': `Navigate to ${data.slug}`
          })}
          data-testid={`CarouselItem-${data.slug}`}
          onMouseEnter={() => onMouseEnter()}
          onMouseLeave={() => onMouseLeave()}
        >
          {active && playerProgress >= 5 && (
            <div
              className="pointer-events-none absolute bottom-0 left-0 h-1.5 rounded-b-2xl bg-red-500/80 transition-[width] duration-1200 ease-linear"
              style={{ width: `${playerProgress}%` }}
              data-testid="ProgressOverlay"
            />
          )}
          <div
            className={`pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/80 transition-opacity duration-200 ${
              active || isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            data-testid="ActiveLayer"
          />
          <div className="relative aspect-video w-40 flex-shrink-0 overflow-hidden rounded-xl bg-black sm:w-48 md:w-60">
            {imageSrc && (
              <Image
                fill
                src={imageSrc}
                alt={imageAlt}
                priority={active}
                style={{
                  width: '100%',
                  objectFit: 'cover',
                  pointerEvents: 'none'
                }}
              />
            )}
            <div
              className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                !active && isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="rounded-full bg-black/60 p-3">
                <Play3 className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 pr-2 text-left sm:pr-3">
            <span
              className="text-xs font-semibold uppercase tracking-wide text-white/70"
              data-testid="CarouselItemCategory"
            >
              {label}
            </span>
            <h3
              className="line-clamp-2 text-base font-semibold leading-snug text-white"
              data-testid={`CarouselItemTitle-${data.slug}`}
            >
              {typeof data.title === 'string' ? data.title : last(data.title)?.value}
            </h3>
          </div>
        </div>
      </ContainerElement>
    </div>
  )
}

export function VideoCard({
  data,
  containerSlug,
  active,
  transparent = false,
  onVideoSelect
}: VideoCardProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { label } = getLabelDetails(t, data.label)
  const href = getWatchUrl(containerSlug, data.label, data.variant?.slug)
  const [isHovered, setIsHovered] = useState(false)
  const { state: playerState } = usePlayer()

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
      playerProgress={playerState.progress}
      interactive={!!onVideoSelect}
    />
  )

  const commonProps = {
    className: `block beveled no-underline text-inherit ${transparent ? 'opacity-70' : ''}`,
    'aria-label': (typeof data.title === 'string' ? data.title : last(data.title)?.value) ?? `Video ${data.slug}`,
    'data-testid': `VideoCard-${data.id}`
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
