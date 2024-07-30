import { BaseHit, Hit } from 'instantsearch.js'
import { useEffect, useRef } from 'react'
import {
  useInfiniteHits,
  useInstantSearch,
  useRefinementList
} from 'react-instantsearch'
import {
  VideoChildFields_imageAlt,
  VideoChildFields_snippet,
  VideoChildFields_title,
  VideoChildFields_variant
} from '../../../../__generated__/VideoChildFields'
import { VideoLabel } from '../../../../__generated__/globalTypes'

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

export function useAlgoliaVideos() {
  const isInitialRender = useRef(true)
  const { status } = useInstantSearch()
  const { hits, showMore, isLastPage } = useInfiniteHits<AlgoliaVideo>()

  const { items, refine } = useRefinementList({
    attribute: 'languageId'
  })

  const transformedHits = transformItems(hits)

  useEffect(() => {
    if (isInitialRender) {
      isInitialRender.current = false
      const hasRefinedLanguage = items.some((item) => item.isRefined)
      if (!hasRefinedLanguage) refine('529')
    }
  }, [items, refine])

  return {
    stalled: status === 'stalled',
    hits: transformedHits,
    showMore,
    isLastPage
  }
}
