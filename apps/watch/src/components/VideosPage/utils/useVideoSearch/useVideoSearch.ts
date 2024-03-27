import algoliasearch from 'algoliasearch'
import { RankingInfo } from 'instantsearch.js'
import isEqual from 'lodash/isEqual'
import { useCallback, useState } from 'react'

import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'
import { checkFilterApplied } from '../checkFilterApplied'
import { convertAlgoliaVideos } from '../convertAlgoliaVideos'

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_KEY ?? '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)
const index = searchClient.initIndex('video-variants')

interface Hit {
  readonly objectID: string
  readonly _highlightResult?: Record<string, unknown> | undefined
  readonly _snippetResult?: Record<string, unknown> | undefined
  readonly _rankingInfo?: RankingInfo | undefined
  readonly _distinctSeqID?: number | undefined
}

interface Hits extends Array<Hit> {}

export interface VideoPageFilter {
  availableVariantLanguageIds?: string[]
  subtitleLanguageIds?: string[]
  title?: string
}

interface UseVideoSearchResult {
  algoliaVideos: VideoChildFields[]
  currentPage: number
  totalPages: number | undefined
  loading: boolean
  handleSearch: (params: VideoPageFilter & { page: number }) => Promise<void>
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

  const handleSearch = useCallback(
    async ({
      availableVariantLanguageIds,
      subtitleLanguageIds,
      title,
      page
    }): Promise<void> => {
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
        } = await index.search(title, {
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

  const algoliaVideos = convertAlgoliaVideos(hits)

  return {
    algoliaVideos,
    currentPage,
    totalPages,
    loading,
    handleSearch
  }
}
