import { BaseHit, Hit } from 'instantsearch.js'
import { useEffect, useState } from 'react'
import {
  UseInfiniteHitsProps,
  useConfigure,
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
  const [defaultRefinement, setDefaultRefinement] = useState<{
    languageId: string[]
  }>({
    languageId: ['529']
  })

  const { hits, showMore, isLastPage } = useInfiniteHits<AlgoliaVideos>({
    transformItems
  })

  const { items } = useRefinementList({
    attribute: 'languageId'
  })

  useEffect(() => {
    if (items.some((item) => item.isRefined)) {
      setDefaultRefinement({ languageId: [] })
    } else {
      setDefaultRefinement({ languageId: ['529'] })
    }
  }, [items])

  useConfigure({
    facetsRefinements: defaultRefinement
  })

  return {
    hits,
    showMore,
    isLastPage
  }
}
