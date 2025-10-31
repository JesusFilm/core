import { FishOff, Plus } from 'lucide-react'
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
  showSequenceNumbers?: boolean
  fallbackVideos?: VideoChildFields[]
  fallbackLoading?: boolean
  onClearSearch?: () => void
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
  analyticsTag,
  showSequenceNumbers = false,
  fallbackVideos = [],
  fallbackLoading = false,
  onClearSearch
}: VideoGridProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const fallbackGridColumns =
    orientation === 'vertical'
      ? 'grid-cols-2 md:grid-cols-4 xl:grid-cols-5'
      : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-4'

  const fallbackSkeletonCount =
    orientation === 'vertical' ? 5 : 4

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
              index={index}
              onClick={onCardClick}
              analyticsTag={analyticsTag}
              showSequenceNumber={showSequenceNumbers}
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
          <div className="w-full rounded-3xl border border-white/10 p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
              <div className="flex justify-center md:justify-start">
                <FishOff
                  className="h-48 w-48 md:h-56 md:w-56 text-stone-200/80"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 flex flex-col gap-4 text-center md:text-left items-center md:items-start">
                <span
                  className="uppercase tracking-widest text-[#FF9E00] font-sans font-bold mb-0 animate-fade-in-up animation-delay-100 text-md"
                >
                  {t('No Results')}
                </span>
                <p
                  className="font-bold text-stone-50 text-shadow-xs mb-0 font-sans animate-fade-in-up animation-delay-200 text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
                >
                  {t('No catch here—try the other side of the boat.')}
                </p>
                {onClearSearch != null && (
                  <div className="flex justify-center md:justify-start animate-fade-in-up animation-delay-300">
                    <button
                      type="button"
                      className="btn-primary"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={onClearSearch}
                    >
                      {t('Try another search')}
                    </button>
                  </div>
                )}
              </div>
            </div>
            {(fallbackLoading || fallbackVideos.length > 0) && (
              <div className="mt-10 flex flex-col gap-4">
                <div className="text-left">
                  <h6 className="text-lg font-semibold text-stone-100">
                    {t('Latest videos in this language')}
                  </h6>
                </div>
                <div className={`grid gap-4 ${fallbackGridColumns}`}>
                  {(fallbackLoading ? Array.from({ length: fallbackSkeletonCount }) : fallbackVideos).map(
                    (video, index) => (
                      <div key={index} className="w-full">
                        <VideoCard
                          video={fallbackLoading ? undefined : video}
                          orientation={orientation}
                          containerSlug={containerSlug}
                          index={index}
                          onClick={onCardClick}
                          analyticsTag={analyticsTag}
                          showSequenceNumber={showSequenceNumbers}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
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
