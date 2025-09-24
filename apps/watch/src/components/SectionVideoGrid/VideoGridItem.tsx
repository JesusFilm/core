import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { SectionVideoCollectionCarouselSlide } from '../SectionVideoCarousel/useSectionVideoCollectionCarouselContent'

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
      className="block relative group shadow-xl shadow-stone-950/70 beveled"
      aria-label={t('Watch {{title}}', { title: slide.title })}
      data-analytics-tag={analyticsTag}
      data-testid={`SectionVideoGridSlide-${slide.id}`}
    >
      <img
        src={slide.imageUrl}
        alt={slide.alt}
        className="w-full aspect-[2/3] object-cover rounded-lg"
      />
      <div className="absolute top-0 left-0 w-full h-full outline-4 outline-transparent hover:outline-white rounded-lg">
        <div className="absolute z-1 bottom-4 flex items-center justify-center w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-16 h-16 rounded-full bg-stone-900/60 flex items-center justify-center hover:bg-red-500">
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
