import { BaseHit, Hit } from 'instantsearch.js'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useInfiniteHits, useRefinementList } from 'react-instantsearch'
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
  const router = useRouter()

  const { hits, showMore, isLastPage } = useInfiniteHits<AlgoliaVideo>()

  const transformedHits = transformItems(hits)

  const { refine } = useRefinementList({
    attribute: 'languageId'
  })

  useEffect(() => {
    const hasSelectedLanguage = router.asPath.includes('languages')
    if (!hasSelectedLanguage) {
      refine('529')
    }
  }, [router, refine])

  return {
    hits: transformedHits,
    showMore,
    isLastPage
  }
}
