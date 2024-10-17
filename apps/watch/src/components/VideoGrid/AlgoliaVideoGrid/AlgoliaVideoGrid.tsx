import type { ReactElement } from 'react'

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
    noResults
  } = useAlgoliaVideos<CoreVideo>({ transformItems })
  return (
    <VideoGrid
      videos={algoliaVideos}
      loading={loading}
      showMore={showMore}
      hasNextPage={!isLastPage}
      hasNoResults={noResults}
      {...props}
    />
  )
}
