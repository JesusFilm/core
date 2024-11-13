import type { MouseEvent, ReactElement } from 'react'

import { useAlgoliaVideos } from '@core/journeys/ui/algolia/useAlgoliaVideos'

import {
  type CoreVideo,
  transformAlgoliaVideos as transformItems
} from '../../../libs/algolia/transformAlgoliaVideos'
import { VideoGrid, VideoGridProps } from '../VideoGrid'

export function AlgoliaVideoGrid(props: VideoGridProps): ReactElement {
  const {
    items: algoliaVideos,
    showMore,
    isLastPage,
    loading,
    noResults,
    sendEvent
  } = useAlgoliaVideos<CoreVideo>({ transformItems })

  const handleClick =
    (videoId?: string) =>
    (event: MouseEvent): void => {
      event.stopPropagation()
      if (videoId == null) return
      const item = algoliaVideos.filter((item) => item.id === videoId)
      sendEvent('click', item, 'Video Clicked')
    }

  return (
    <VideoGrid
      videos={algoliaVideos}
      loading={loading}
      showMore={showMore}
      hasNextPage={!isLastPage}
      hasNoResults={noResults}
      onCardClick={handleClick}
      {...props}
    />
  )
}
