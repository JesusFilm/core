import { Plus } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import type { ComponentProps, MouseEvent, ReactElement } from 'react'

import type { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VideoCard } from '../VideoCard'

export interface VideoGridProps {
  videos?: VideoChildFields[]
  showLoadMore?: boolean
  containerSlug?: string
  orientation?: 'horizontal' | 'vertical'
  loading?: boolean
  showMore?: () => void
  hasNextPage?: boolean
  hasNoResults?: boolean
  onCardClick?: (videoId?: string) => (event: MouseEvent) => void
  analyticsTag?: string
}

export function VideoGrid({
  videos = [],
  showLoadMore = false,
  containerSlug,
  orientation = 'horizontal',
  loading = false,
  showMore,
  hasNextPage = true,
  hasNoResults = false,
  onCardClick,
  analyticsTag
}: VideoGridProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <div
      className={`grid gap-4 ${orientation === 'vertical' ? 'grid-cols-2 md:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-4'}`}
      data-testid="VideoGrid"
    >
      {(videos?.length ?? 0) > 0 &&
        videos?.map((video, index) => (
          <div key={index} className="w-full">
            <VideoCard
              video={video}
              orientation={orientation}
              containerSlug={containerSlug}
              onClick={onCardClick}
              analyticsTag={analyticsTag}
            />
          </div>
        ))}
      {loading && videos?.length === 0 && (
        <>
          <div className="w-full">
            <VideoCard orientation={orientation} analyticsTag={analyticsTag} />
          </div>
          <div className="w-full">
            <VideoCard orientation={orientation} analyticsTag={analyticsTag} />
          </div>
          <div className="w-full hidden md:block">
            <VideoCard orientation={orientation} analyticsTag={analyticsTag} />
          </div>
          <div className="w-full hidden xl:block">
            <VideoCard orientation={orientation} analyticsTag={analyticsTag} />
          </div>
        </>
      )}
      {!loading && hasNoResults && (
        <div className="w-full flex justify-center items-center col-span-full">
          <div className="w-full rounded-lg border border-gray-200 bg-white p-8 text-center">
            <h6 className="text-xl font-semibold text-primary mb-2">
              {t('Sorry, no results')}
            </h6>
            <p className="text-base mt-2">
              {t('Try removing or changing something from your request')}
            </p>
          </div>
        </div>
      )}
      {showLoadMore && !hasNoResults && (
        <div className="w-full col-span-full">
          <div className="flex justify-center py-6">
            <button
              className={`btn-outlined flex items-center gap-2 ${!hasNextPage ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={showMore}
              disabled={!hasNextPage}
            >
              <Plus className="w-4 h-4" />
              {loading
                ? 'Loading...'
                : hasNextPage
                  ? 'Load More'
                  : 'No More Videos'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
