import type { ReactElement } from 'react'

import { useAlgoliaVideos } from '../../../libs/algolia/useAlgoliaVideos'
import { VideoGrid, VideoGridProps } from '../VideoGrid'

export function AlgoliaVideoGrid(props: VideoGridProps): ReactElement {
  const {
    hits: algoliaVideos,
    showMore,
    isLastPage,
    loading,
    noResults
  } = useAlgoliaVideos()
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
