import { BaseHit, Hit } from 'instantsearch.js'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import {
  UseInfiniteHitsProps,
  useInfiniteHits,
  useRefinementList
} from 'react-instantsearch'
import {} from '../../../../__generated__/VideoChildFields'

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

export const transformItems: UseInfiniteHitsProps<AlgoliaVideo>['transformItems'] =
  (items) =>
    items.map((videoVariant) => ({
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
    })) as unknown as AlgoliaVideo[]

export function useAlgoliaVideos() {
  const router = useRouter()

  const { hits, showMore, isLastPage } = useInfiniteHits<AlgoliaVideo>({
    transformItems
  })

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
    hits,
    showMore,
    isLastPage
  }
}
