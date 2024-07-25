import { BaseHit, Hit } from 'instantsearch.js'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import {
  UseInfiniteHitsProps,
  useInfiniteHits,
  useRefinementList
} from 'react-instantsearch'
import {
  VideoChildFields_imageAlt,
  VideoChildFields_snippet,
  VideoChildFields_title,
  VideoChildFields_variant
} from '../../../../__generated__/VideoChildFields'
import { VideoLabel } from '../../../../__generated__/globalTypes'

export interface AlgoliaVideos extends Hit<BaseHit> {
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

export const transformItems: UseInfiniteHitsProps<AlgoliaVideos>['transformItems'] =
  (items) => {
    return items.map((videoVariant) => ({
      __typename: 'Video',
      id: videoVariant.videoId,
      label: videoVariant.label,
      title: [
        {
          value: (videoVariant.titles as VideoChildFields_title[]).map(
            (title) => title
          )
        }
      ],
      image: videoVariant.image,
      imageAlt: videoVariant.imageAlt,
      snippet: [],
      slug: videoVariant.slug,
      variant: {
        id: videoVariant.objectID,
        duration: videoVariant.duration,
        hls: null,
        slug: videoVariant.slug
      },
      childrenCount: videoVariant.childrenCount
    })) as unknown as AlgoliaVideos[]
  }

export function useAlgoliaVideos() {
  const router = useRouter()

  const { hits, showMore, isLastPage } = useInfiniteHits<AlgoliaVideos>({
    transformItems
  })

  const { refine } = useRefinementList({
    attribute: 'languageId'
  })

  useEffect(() => {
    const hasSelectedLanguage = router.asPath.includes('languages')
    const isVideosPage = router.asPath.includes('videos')
    if (!hasSelectedLanguage && isVideosPage) {
      refine('529')
    }
  }, [router, refine])

  return {
    hits,
    showMore,
    isLastPage
  }
}
