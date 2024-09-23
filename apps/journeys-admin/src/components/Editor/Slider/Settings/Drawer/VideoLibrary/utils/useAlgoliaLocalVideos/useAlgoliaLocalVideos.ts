import { BaseHit, Hit } from 'instantsearch.js'
import { useInfiniteHits, useInstantSearch } from 'react-instantsearch'

import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { VideoListProps } from '../../VideoList/VideoList'

export interface AlgoliaVideoItem extends Hit<BaseHit> {
  label: string
  videoId: string
  titles: string[]
  description: string[]
  image: string
  duration: number
}

type FilterFunction = (item: AlgoliaVideoItem) => boolean

export function transformItems(
  items: AlgoliaVideoItem[],
  filter: FilterFunction
): VideoListProps['videos'] {
  return items.filter(filter).map((videoVariant) => ({
    id: videoVariant.videoId,
    title: videoVariant.titles[0],
    description: videoVariant.description[0],
    image: videoVariant.image,
    duration: videoVariant.duration,
    source: VideoBlockSource.internal
  }))
}

const defaultFilter: FilterFunction = (item) =>
  item.label !== 'collection' && item.label !== 'series'

interface AlgoliaLocalVideos {
  loading: boolean
  isLastPage: boolean
  items: VideoListProps['videos']
  showMore: () => void
}

interface UseAlgoliaLocalVideosProps {
  filter?: FilterFunction
}

export function useAlgoliaLocalVideos({
  filter = defaultFilter
}: UseAlgoliaLocalVideosProps = {}): AlgoliaLocalVideos {
  const { status } = useInstantSearch()
  const { items, showMore, isLastPage } = useInfiniteHits<AlgoliaVideoItem>()

  const transformedItems = transformItems(items, filter)

  return {
    loading: status === 'loading' || status === 'stalled',
    isLastPage,
    items: transformedItems,
    showMore
  }
}
