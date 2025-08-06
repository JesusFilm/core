import { BaseHit, Hit } from 'instantsearch.js'
import { SendEventForHits } from 'instantsearch.js/es/lib/utils'
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
  titlesWithLanguages: {
    languageId: string
    value: string
  }[]
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
  return items.map((videoVariant) => ({
    id: videoVariant.videoId,
    title: videoVariant.titles[0],
    description: videoVariant.description[0],
    image: videoVariant.image,
    duration: videoVariant.duration,
    source: VideoBlockSource.internal
  }))
}

interface useAlgoliaVideosOptions<T> {
  transformItems?: (items: Array<Hit<AlgoliaVideo>>, languageId?: string) => T[]
  languageId?: string
}

interface useAlgoliaVideosResult<T> {
  items: T[]
  loading: boolean
  noResults: boolean
  isLastPage: boolean
  showMore: () => void
  sendEvent: SendEventForHits
}

export function useAlgoliaVideos<T = Video>(
  options?: useAlgoliaVideosOptions<T>
): useAlgoliaVideosResult<T> {
  const { transformItems = transformItemsDefault, languageId } = options ?? {}

  const { status, results } = useInstantSearch()
  const { items, showMore, isLastPage, sendEvent } =
    useInfiniteHits<AlgoliaVideo>()

  const transformedItems = transformItems(items, languageId) as T[]

  return {
    showMore,
    sendEvent,
    isLastPage,
    items: transformedItems,
    loading: status === 'loading' || status === 'stalled',
    noResults: !(results.__isArtificial ?? false) && results.nbHits === 0
  }
}
