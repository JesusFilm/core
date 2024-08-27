import type { BaseHit, Hit } from 'instantsearch.js'
import type { SendEventForHits } from 'instantsearch.js/es/lib/utils'
import { useInfiniteHits, useInstantSearch } from 'react-instantsearch'

import type { VideoLabel } from '../../../../__generated__/globalTypes'
import type {
  VideoChildFields_imageAlt,
  VideoChildFields_snippet,
  VideoChildFields_title,
  VideoChildFields_variant
} from '../../../../__generated__/VideoChildFields'

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

export interface CoreVideo extends Hit<BaseHit> {
  __typename: 'Video'
  id: string
  label: VideoLabel
  title: VideoChildFields_title[]
  image: string | null
  imageAlt: VideoChildFields_imageAlt[]
  snippet: VideoChildFields_snippet[]
  slug: string
  variant: VideoChildFields_variant | null
  childrenCount: number
}

export function transformItems(items: AlgoliaVideo[]): CoreVideo[] {
  return items.map((videoVariant) => ({
    __typename: 'Video',
    id: videoVariant.videoId,
    label: videoVariant.label,
    title: [
      {
        value: videoVariant.titles[0]
      }
    ],
    image: videoVariant.image,
    imageAlt: [
      {
        value: videoVariant.imageAlt
      }
    ],
    snippet: [],
    slug: videoVariant.slug,
    variant: {
      id: videoVariant.objectID,
      duration: videoVariant.duration,
      hls: null,
      slug: videoVariant.slug
    },
    childrenCount: videoVariant.childrenCount
  })) as unknown as CoreVideo[]
}

export function useAlgoliaVideos(): {
  loading: boolean
  noResults: boolean
  hits: CoreVideo[]
  showMore: () => void
  isLastPage: boolean
  sendEvent: SendEventForHits
} {
  const { status, results } = useInstantSearch()
  const { hits, showMore, isLastPage, sendEvent } =
    useInfiniteHits<AlgoliaVideo>()

  const transformedHits = transformItems(hits)

  return {
    loading: status === 'stalled' || status === 'loading',
    noResults: !(results.__isArtificial ?? false) && results.nbHits === 0,
    hits: transformedHits,
    showMore,
    isLastPage,
    sendEvent
  }
}
