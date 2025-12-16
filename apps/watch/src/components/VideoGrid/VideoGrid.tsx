import { FishOff, Plus } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import type { MouseEvent, ReactElement } from 'react'

import type { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VideoCard } from '../VideoCard'

export interface VideoGridProps {
  videos?: VideoChildFields[]
  showLoadMore?: boolean
  containerSlug?: string
  containerSlugMap?: Map<string, string | undefined>
  orientation?: 'horizontal' | 'vertical'
  loading?: boolean
  showMore?: () => void
  hasNextPage?: boolean
  hasNoResults?: boolean
  onCardClick?: (videoId?: string) => (event: MouseEvent) => void
  analyticsTag?: string
  showSequenceNumbers?: boolean
  onCardHoverChange?: (
    data?: { imageUrl: string; blurhash: string; dominantColor: string } | null
  ) => void
  fallbackVideos?: VideoChildFields[]
  fallbackLoading?: boolean
  onClearSearch?: () => void
  selectedLanguages?: string[]
  variant?: string
}

export function VideoGrid({
  videos = [],
  showLoadMore = false,
  containerSlug,
  containerSlugMap,
  orientation = 'horizontal',
  loading = false,
  showMore,
  hasNextPage = true,
  hasNoResults = false,
  onCardClick,
  analyticsTag,
  showSequenceNumbers = false,
  onCardHoverChange,
  fallbackVideos = [],
  fallbackLoading = false,
  onClearSearch,
  selectedLanguages = []
}: VideoGridProps): ReactElement {
  const { t } = useTranslation('apps-watch')

  const getFallbackTitle = () => {
    if (selectedLanguages.length === 0) {
      return t('Latest videos')
    }

    if (selectedLanguages.length === 1) {
      return t('Latest videos in {{language}}', {
        language: selectedLanguages[0]
      })
    }

    return t('Latest videos in {{languages}}', {
      languages:
        selectedLanguages.slice(0, -1).join(', ') +
        ' and ' +
        selectedLanguages[selectedLanguages.length - 1]
    })
  }

  const fallbackGridColumns =
    orientation === 'vertical'
      ? 'grid-cols-2 md:grid-cols-4 xl:grid-cols-5'
      : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-4'

  const fallbackSkeletonCount = orientation === 'vertical' ? 5 : 4

  return (
    <div
      className={`grid gap-4 ${orientation === 'vertical' ? 'grid-cols-2 md:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-3 xl:grid-cols-4'}`}
      data-testid="VideoGrid"
    >
      {(videos?.length ?? 0) > 0 &&
        videos?.map((video, index) => {
          const videoContainerSlug =
            containerSlugMap?.get(video.id) ?? containerSlug
          return (
            <div key={index} className="w-full">
              <VideoCard
                video={video}
                orientation={orientation}
                containerSlug={videoContainerSlug}
                index={index}
                onClick={onCardClick}
                analyticsTag={analyticsTag}
                showSequenceNumber={showSequenceNumbers}
                onHoverImageChange={onCardHoverChange}
              />
            </div>
          )
        })}
      {loading && videos?.length === 0 && (
        <>
          <div className="w-full">
            <div className={`w-full ${orientation === 'vertical' ? 'aspect-[2/3]' : 'aspect-video'} animate-pulse rounded-lg bg-white/10`} />
          </div>
          <div className="w-full">
            <div className={`w-full ${orientation === 'vertical' ? 'aspect-[2/3]' : 'aspect-video'} animate-pulse rounded-lg bg-white/10`} />
          </div>
          <div className="hidden w-full md:block">
            <div className={`w-full ${orientation === 'vertical' ? 'aspect-[2/3]' : 'aspect-video'} animate-pulse rounded-lg bg-white/10`} />
          </div>
          <div className="hidden w-full xl:block">
            <div className={`w-full ${orientation === 'vertical' ? 'aspect-[2/3]' : 'aspect-video'} animate-pulse rounded-lg bg-white/10`} />
          </div>
        </>
      )}
      {!loading && hasNoResults && (
        <div className="col-span-full flex w-full items-center justify-center">
          <div className="w-full rounded-3xl border border-white/10 p-6 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
              <div className="flex justify-center md:justify-start">
                <FishOff
                  className="h-30 w-30 text-stone-200 md:h-20 md:w-20"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-1 flex-col items-center gap-4 text-center md:items-start md:text-left">
                <span className="animate-fade-in-up animation-delay-100 text-md mb-0 font-sans font-bold tracking-widest text-[#FF9E00] uppercase">
                  {t('No videos found')}
                </span>
                <p className="animate-fade-in-up animation-delay-200 mb-0 font-sans text-2xl font-bold text-stone-50 text-shadow-xs md:text-2xl lg:text-3xl xl:text-4xl">
                  {t('No catch here—try the other side of the boat.')}
                </p>
                {onClearSearch != null && (
                  <div className="animate-fade-in-up animation-delay-300 flex justify-center md:justify-start">
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
                    {getFallbackTitle()}
                  </h6>
                </div>
                <div className={`grid gap-4 ${fallbackGridColumns}`}>
                  {(fallbackLoading
                    ? Array.from({ length: fallbackSkeletonCount }, () => undefined)
                    : fallbackVideos
                  ).map((video, index) => {
                    const videoContainerSlug =
                      (video && containerSlugMap?.get(video.id)) ?? containerSlug
                    return (
                      <div key={index} className="w-full">
                        {fallbackLoading ? (
                          <div className={`w-full ${orientation === 'vertical' ? 'aspect-[2/3]' : 'aspect-video'} animate-pulse rounded-lg bg-white/10`} />
                        ) : (
                          <VideoCard
                            video={video}
                            orientation={orientation}
                            containerSlug={videoContainerSlug}
                            index={index}
                            onClick={onCardClick}
                            analyticsTag={analyticsTag}
                            showSequenceNumber={showSequenceNumbers}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showLoadMore && !hasNoResults && (
        <div className="col-span-full w-full">
          <div className="flex justify-center py-6">
            <button
              className={`btn-outlined flex items-center gap-2 ${!hasNextPage ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={showMore}
              disabled={!hasNextPage}
            >
              <Plus className="h-4 w-4" />
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
