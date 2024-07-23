import {} from 'instantsearch.js'
import { useEffect, useState } from 'react'
import {
  useConfigure,
  useInfiniteHits,
  useRefinementList
} from 'react-instantsearch'

export function transformAlgoliaVideos(hits) {
  console.log('hits', hits)
  return hits.map((videoVariant) => {
    return {
      id: videoVariant.videoId,
      label: videoVariant.label,
      title: [{ value: videoVariant.titles.map((title) => title) }],
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
    }
  })
}

export function useAlgoliaVideos() {
  const [defaultRefinement, setDefaultRefinement] = useState<{
    languageId: string[]
  }>({
    languageId: ['529']
  })

  const { hits, showMore, isLastPage } = useInfiniteHits({
    transformItems: transformAlgoliaVideos
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
