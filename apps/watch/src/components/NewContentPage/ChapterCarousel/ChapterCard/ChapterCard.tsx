import Image from 'next/image'
import { ReactElement } from 'react'

import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'

interface ChapterCardProps {
  video: VideoChildFields
}

export function ChapterCard({ video }: ChapterCardProps): ReactElement {
  const handleNavigationClick = (slug: string) => {
    const element = document.getElementById(slug)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div
      className="relative beveled max-w-[200px] h-[240px] flex flex-col justify-end w-full rounded-lg overflow-hidden cursor-pointer"
      onClick={() => handleNavigationClick(video.slug)}
      onKeyDown={(e) => e.key === 'Enter' && handleNavigationClick(video.slug)}
      tabIndex={0}
      role="button"
      aria-label={`Navigate to ${video.slug}`}
      data-testid={`CarouselItem-${video.slug}`}
    >
      <Image
        fill
        src={video.images[0].mobileCinematicHigh ?? ''}
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
  )
}
