import { BaseHit, Hit } from 'instantsearch.js'
import { useInfiniteHits, useInstantSearch } from 'react-instantsearch'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'

interface Video {
  id: string
  title?: string
  description?: string
  image?: string
  duration?: number
  source: VideoBlockSource
}

export interface AlgoliaVideo extends Hit<BaseHit> {
  videoId: string
  titles: string[]
  description: string[]
  duration: number
  languageId: string
  subtitles: string[]
  slug: string
  label: string
  image: string
  imageAlt: string
  childrenCount: number
  objectID: string
}

export function transformItemsDefault(items: AlgoliaVideo[]): Video[] {
  return items
    .filter((item) => item.label !== 'collection' && item.label !== 'series')
    .map((videoVariant) => ({
      id: videoVariant.videoId,
      title: videoVariant.titles[0],
      description: videoVariant.description[0],
      image: videoVariant.image,
      duration: videoVariant.duration,
      source: VideoBlockSource.internal
    }))
}

interface useAlgoliaVideosOptions<T> {
  transformItems?: (items: Array<Hit<AlgoliaVideo>>) => T[]
}

interface useAlgoliaVideosResult<T> {
  loading: boolean
  isLastPage: boolean
  items: T[]
  showMore: () => void
}

export function useAlgoliaVideos<T = Video>(
  options?: useAlgoliaVideosOptions<T>
): useAlgoliaVideosResult<T> {
  const { transformItems } = options ?? {}
  const { status } = useInstantSearch()
  const { items, showMore, isLastPage } = useInfiniteHits<AlgoliaVideo>()

  const transformedItems = (transformItems ?? transformItemsDefault)(
    items
  ) as T[]

  return {
    loading: status === 'loading' || status === 'stalled',
    isLastPage,
    items: transformedItems,
    showMore
  }
}
