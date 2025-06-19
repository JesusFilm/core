import Image from 'next/image'
import NextLink from 'next/link'
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
  const { label } = getLabelDetails(video.label)
  const href = getWatchUrl(containerSlug, video.label, video.variant?.slug)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <NextLink
      href={href}
      scroll={false}
      className="block no-underline text-inherit"
      style={{ pointerEvents: video != null ? 'auto' : 'none' }}
      aria-label="VideoCard"
      data-testid={video != null ? `VideoCard-${video.id}` : 'VideoCard'}
    >
      <div className="flex flex-col gap-6">
        <button
          data-testid={`VideoCardButton-${video.slug}`}
          name={video.title[0].value}
          disabled={video == null}
          className="rounded-lg w-full relative text-left border-none bg-transparent p-0 cursor-pointer disabled:cursor-default"
        >
          <div
            className="relative max-w-[200px] h-60 flex flex-col justify-end w-full rounded-xl cursor-pointer bg-black"
            tabIndex={0}
            role="button"
            data-testid={`CarouselItem-${video.slug}`}
            aria-label={`Navigate to ${video.slug}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Image Layer */}
            <div className="absolute left-0 right-0 top-0 bottom-0 rounded-lg overflow-hidden">
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
              className={`absolute left-0 right-0 top-0 bottom-0 rounded-lg overflow-visible transition-all duration-100 ease-in-out pointer-events-none ${
                active || isHovered ? 'shadow-[inset_0_0_0_4px_#fff]' : ''
              }`}
              data-testid="ActiveLayer"
            />

            {/* Play Button with Fade */}
            <button
              className={`absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-20 h-20 flex items-center justify-center text-white bg-red-500 bg-opacity-50 rounded-full transition-all duration-300 cursor-pointer z-2 ${
                !active && isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                pointerEvents: 'none'
              }}
            >
              <Play3 className="text-6xl" />
            </button>

            {/* Content */}
            <div className="p-4 font-sans z-1">
              <span
                className="font-apercu text-xs font-medium tracking-widest uppercase opacity-50"
                data-testid="CarouselItemCategory"
              >
                {label}
              </span>
              <h3
                className="font-apercu text-base font-bold leading-tight opacity-70 overflow-hidden"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical'
                }}
                data-testid={`CarouselItemTitle-${video.slug}`}
              >
                {video.title[0].value}
              </h3>
            </div>
          </div>
        </button>
      </div>
    </NextLink>
  )
}
