import algoliasearch from 'algoliasearch'
import { RankingInfo } from 'instantsearch.js'
import isEqual from 'lodash/isEqual'
import { useCallback, useEffect, useState } from 'react'

import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'
import { checkFilterApplied } from '../checkFilterApplied'
import { VideoPageFilter } from '../getQueryParameters'
import { transformAlgoliaVideos } from '../transformAlgoliaVideos'

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)
const index = searchClient.initIndex(
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''
)

interface Hit {
  readonly objectID: string
  readonly _highlightResult?: Record<string, unknown> | undefined
  readonly _snippetResult?: Record<string, unknown> | undefined
  readonly _rankingInfo?: RankingInfo | undefined
  readonly _distinctSeqID?: number | undefined
}

interface Hits extends Array<Hit> {}

interface UseVideoSearchResult {
  algoliaVideos: VideoChildFields[]
  isEnd: boolean
  loading: boolean
  handleSearch: (filter: VideoPageFilter, page: number) => Promise<void>
  handleLoadMore: () => Promise<void>
}

interface useVideoSearchProps {
  filter: VideoPageFilter
}

export function useVideoSearch({
  filter
}: useVideoSearchProps): UseVideoSearchResult {
  const [hits, setHits] = useState<Hits>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isEnd, setIsEnd] = useState(false)

  useEffect(() => {
    if (!checkFilterApplied(filter)) {
      setIsEnd(true)
      return
    }

    if (currentPage === 0 && totalPages === 0) {
      setIsEnd(true)
    } else {
      setIsEnd(currentPage + 1 === totalPages)
    }
  }, [currentPage, totalPages, filter])

  const handleSearch = useCallback(
    async (
      { availableVariantLanguageIds, subtitleLanguageIds, title },
      page
    ): Promise<void> => {
      const previousFilter: VideoPageFilter = {
        availableVariantLanguageIds,
        subtitleLanguageIds,
        title
      }

      if (!checkFilterApplied(previousFilter)) {
        setHits([])
        return
      }
      try {
        setLoading(true)
        const subtitleString =
          subtitleLanguageIds !== undefined
            ? ` AND subtitles:${subtitleLanguageIds}`
            : ''

        const {
          hits: resultHits,
          page: pageNumber,
          nbPages: totalPages
        } = await index.search(typeof title === 'string' ? title : '', {
          page,
          filters: `languageId:${
            availableVariantLanguageIds ?? '529'
          }${subtitleString}`
        })

        const newHits = isEqual(previousFilter, filter)
          ? [...hits, ...resultHits]
          : resultHits

        setHits(newHits)
        setCurrentPage(pageNumber)
        setTotalPages(totalPages)
      } catch (error) {
        console.error('Error occurred while searching:', error)
      } finally {
        setLoading(false)
      }
    },
    [filter, hits]
  )

  const algoliaVideos = transformAlgoliaVideos(hits)

  const handleLoadMore = useCallback(async (): Promise<void> => {
    const { title, availableVariantLanguageIds, subtitleLanguageIds } = filter
    if (isEnd || loading) return
    await handleSearch(
      {
        title,
        availableVariantLanguageIds,
        subtitleLanguageIds
      },
      currentPage + 1
    )
  }, [isEnd, loading, currentPage, handleSearch, filter])

  return {
    algoliaVideos,
    isEnd,
    loading,
    handleSearch,
    handleLoadMore
  }
}
