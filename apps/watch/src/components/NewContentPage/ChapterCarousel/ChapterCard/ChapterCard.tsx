import { Box, Skeleton } from '@mui/material'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'

import { VideoLabel } from '../../../../../__generated__/globalTypes'
import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'

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

interface ChapterCardProps {
  containerSlug?: string
  video: VideoChildFields
}

export function ChapterCard({
  containerSlug,
  video
}: ChapterCardProps): ReactElement {
  const handleNavigationClick = (slug: string) => {
    const element = document.getElementById(slug)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return video?.images[0]?.mobileCinematicHigh != null ? (
    <div
      className="relative beveled h-[240px] flex flex-col justify-end w-full rounded-lg overflow-hidden cursor-pointer"
      onClick={() => handleNavigationClick(video.slug)}
      onKeyDown={(e) => e.key === 'Enter' && handleNavigationClick(video.slug)}
      tabIndex={0}
      role="button"
      aria-label={`Navigate to ${video.title[0].value}`}
      data-testid={`CarouselItem-${video.slug}`}
    >
      <Image
        fill
        src={video.images[0].mobileCinematicHigh}
        alt={video.imageAlt[0].value}
        className="absolute top-0 w-full h-[150px] object-cover overflow-hidden [mask-image:linear-gradient(to_bottom,rgba(0,0,0,1)_50%,transparent_100%)] [mask-size:cover]"
      />
      <div className="p-4">
        <span
          className="text-xs font-medium tracking-wider uppercase text-amber-100/60"
          data-testid="CarouselItemCategory"
        >
          {video.label}
        </span>
        <h3
          className="text-base font-bold text-white/90 leading-tight line-clamp-3"
          data-testid={`CarouselItemTitle-${video.slug}`}
        >
          {video.title[0].value}
        </h3>
      </div>
    </div>
  ) : (
    <Box>
      {/* TODO: Add proper fallback styles */}
      <Skeleton />
    </Box>
  )
}
