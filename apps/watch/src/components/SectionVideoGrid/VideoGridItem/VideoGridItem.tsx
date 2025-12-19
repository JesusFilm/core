import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { SectionVideoCollectionCarouselSlide } from '../../SectionVideoCarousel/useSectionVideoCollectionCarouselContent'

interface VideoGridItemProps {
  slide: SectionVideoCollectionCarouselSlide
  analyticsTag?: string
}

export function VideoGridItem({
  slide,
  analyticsTag
}: VideoGridItemProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <a
      href={slide.href}
      className="group beveled relative block overflow-hidden rounded-lg shadow-xl shadow-stone-950/70"
      aria-label={t('Watch {{title}}', { title: slide.title })}
      data-analytics-tag={analyticsTag}
      data-testid={`SectionVideoGridSlide-${slide.id}`}
    >
      <img
        src={slide.imageUrl}
        alt={slide.alt}
        className="poster-hover-zoom aspect-[2/3] w-full rounded-lg object-cover"
      />
      <div className="absolute top-0 left-0 h-full w-full rounded-lg outline-4 outline-transparent hover:outline-white">
        <div className="absolute bottom-4 z-1 flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-900/60 hover:bg-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  )
}
