import algoliasearch from 'algoliasearch'
import { RankingInfo } from 'instantsearch.js'
import { useEffect, useState } from 'react'

import { VideoListItemProps } from '../../../../Slider/Settings/Drawer/VideoLibrary/VideoList/VideoListItem/VideoListItem'
import { transformAlgoliaVideos } from '../transformAlgoliaVideos/transformAlgoliaVideos'

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

export interface LocalVideoFields
  extends Array<
    Pick<
      VideoListItemProps,
      'id' | 'title' | 'description' | 'image' | 'duration' | 'source'
    >
  > {}

interface UseVideoSearchResult {
  isEnd: boolean
  loading: boolean
  handleSearch: (searchQuery: string, page: number) => Promise<void>
  handleLoadMore: (searchQuery: string) => Promise<void>
  algoliaVideos: LocalVideoFields
}

export function useVideoSearch(): UseVideoSearchResult {
  const [hits, setHits] = useState<Hits>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isEnd, setIsEnd] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (currentPage === 0 && totalPages === 0) {
      setIsEnd(true)
    } else {
      setIsEnd(currentPage + 1 === totalPages)
    }
  }, [currentPage, totalPages])

  async function handleSearch(
    searchQuery: string,
    page: number,
    loadMore?: boolean
  ): Promise<void> {
    try {
      setLoading(true)
      const {
        hits: resultHits,
        page: pageNumber,
        nbPages: totalPages
      } = await index.search(searchQuery, {
        page,
        hitsPerPage: 5,
        filters: 'languageId:529'
      })

      const newHits = loadMore === true ? [...hits, ...resultHits] : resultHits
      setHits(newHits)
      setCurrentPage(pageNumber)
      setTotalPages(totalPages)
    } catch (error) {
      console.error('Error occurred while searching:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLoadMore(searchQuery: string): Promise<void> {
    if (isEnd || loading) return
    await handleSearch(searchQuery, currentPage + 1, true)
  }

  const algoliaVideos = transformAlgoliaVideos(hits)

  return {
    isEnd,
    loading,
    handleSearch,
    handleLoadMore,
    algoliaVideos
  }
}
