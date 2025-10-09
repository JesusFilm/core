import last from 'lodash/last'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Play3 from '@core/shared/ui/icons/Play3'

import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'
import { getLabelDetails } from '../../../../libs/utils/getLabelDetails/getLabelDetails'
import { getWatchUrl } from '../../../../libs/utils/getWatchUrl'

interface VideoCardProps {
  video: VideoChildFields
  containerSlug?: string
  active: boolean
}

export function VideoCard({
  video,
  containerSlug,
  active
}: VideoCardProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { label } = getLabelDetails(t, video.label)
  const href = getWatchUrl(containerSlug, video.label, video.variant?.slug)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <NextLink
      href={href}
      scroll={false}
      className="block text-inherit no-underline"
      style={{ pointerEvents: video != null ? 'auto' : 'none' }}
      aria-label="VideoCard"
      data-testid={video != null ? `VideoCard-${video.id}` : 'VideoCard'}
      locale={false}
    >
      <div className="flex flex-col gap-6">
        <button
          data-testid={`VideoCardButton-${video.slug}`}
          name={last(video.title)?.value}
          disabled={video == null}
          className="relative w-full cursor-pointer rounded-lg border-none bg-transparent p-0 text-left disabled:cursor-default"
        >
          <div
            className="relative flex h-60 w-full max-w-[200px] cursor-pointer flex-col justify-end rounded-xl bg-black"
            tabIndex={0}
            role="button"
            data-testid={`CarouselItem-${video.slug}`}
            aria-label={`Navigate to ${video.slug}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Image Layer */}
            <div className="absolute top-0 right-0 bottom-0 left-0 overflow-hidden rounded-lg">
              <Image
                fill
                src={video.images[0].mobileCinematicHigh ?? ''}
                alt={video.imageAlt[0].value}
                style={{
                  width: '100%',
                  objectFit: 'cover',
                  maskImage:
                    'linear-gradient(to bottom, rgba(0,0,0,1) 50%, transparent 100%)',
                  maskSize: 'cover',
                  pointerEvents: 'none'
                }}
              />
            </div>

            {/* Active/Hover Border Layer */}
            <div
              className={`pointer-events-none absolute top-0 right-0 bottom-0 left-0 overflow-visible rounded-lg transition-all duration-100 ease-in-out ${
                active || isHovered ? 'shadow-[inset_0_0_0_4px_#fff]' : ''
              }`}
              data-testid="ActiveLayer"
            />

            {/* Play Button with Fade */}
            <button
              className={`bg-opacity-50 absolute top-1/2 right-1/2 z-2 flex h-20 w-20 translate-x-1/2 -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full bg-red-500 text-white transition-all duration-300 ${
                !active && isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                pointerEvents: 'none'
              }}
            >
              <Play3 className="text-6xl" />
            </button>

            {/* Content */}
            <div className="z-1 p-4 font-sans">
              <span
                className="font-apercu text-xs font-medium tracking-widest uppercase opacity-50"
                data-testid="CarouselItemCategory"
              >
                {label}
              </span>
              <h3
                className="font-apercu overflow-hidden text-base leading-tight font-bold opacity-70"
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
          </div>
        </button>
      </div>
    </NextLink>
  )
}
