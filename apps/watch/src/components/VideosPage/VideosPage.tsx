import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import algoliasearch from 'algoliasearch'
import { RankingInfo } from 'instantsearch.js'
import identity from 'lodash/identity'
import isEqual from 'lodash/isEqual'
import some from 'lodash/some'
import { useRouter } from 'next/router'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

import { GetLanguages } from '../../../__generated__/GetLanguages'
import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import { FilterList } from './FilterList'
import { VideosHero } from './Hero'
import { VideosSubHero } from './SubHero'
import { convertAlgoliaVideos } from './utils'

export const GET_LANGUAGES = gql`
  query GetLanguages($languageId: ID) {
    languages(limit: 5000) {
      id
      name(languageId: $languageId, primary: true) {
        value
        primary
      }
    }
  }
`

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_KEY ?? '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)
const index = searchClient.initIndex('video-variants')

export interface VideoPageFilter {
  availableVariantLanguageIds?: string[]
  subtitleLanguageIds?: string[]
  title?: string
}

interface Hit {
  readonly objectID: string
  readonly _highlightResult?: Record<string, unknown> | undefined
  readonly _snippetResult?: Record<string, unknown> | undefined
  readonly _rankingInfo?: RankingInfo | undefined
  readonly _distinctSeqID?: number | undefined
}

interface Hits extends Array<Hit> {}

interface VideoProps {
  videos: VideoChildFields[]
}

export function VideosPage({ videos }: VideoProps): ReactElement {
  const router = useRouter()
  const [hits, setHits] = useState<Hits>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)
  const [isEnd, setIsEnd] = useState(false)

  const localVideos = videos.filter((video) => video !== null)
  const algoliaVideos = convertAlgoliaVideos(hits)

  const { data: languagesData, loading: languagesLoading } =
    useQuery<GetLanguages>(GET_LANGUAGES, {
      variables: { languageId: '529' }
    })

  // we intentionally use window.location.search to prevent multiple renders
  // which occurs when using const { query } = useRouter()
  const searchString =
    typeof window !== 'undefined' ? window.location.search : undefined

  const filter: VideoPageFilter = useMemo(() => {
    const query = new URLSearchParams(searchString?.split('?')[1])

    const getQueryParamArray = (param: string | null): string[] | undefined =>
      param != null ? [param] : undefined

    return {
      availableVariantLanguageIds: getQueryParamArray(query.get('languages')),
      subtitleLanguageIds: getQueryParamArray(query.get('subtitles')),
      title: query.get('title') ?? undefined
    }
  }, [searchString])

  const filterApplied = some(
    [
      filter.title,
      filter.availableVariantLanguageIds,
      filter.subtitleLanguageIds
    ],
    identity
  )

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

  function isAtEnd(currentPage: number, totalPages: number): boolean {
    if (currentPage === totalPages) return true
    return false
  }

  function handleFilterChange(filter: VideoPageFilter): void {
    const { title, availableVariantLanguageIds, subtitleLanguageIds } = filter
    const params = new URLSearchParams()

    const setQueryParam = (paramName: string, value?: string | null): void => {
      if (value != null) {
        params.set(paramName, value)
      }
    }

    setQueryParam('languages', filter.availableVariantLanguageIds?.[0])
    setQueryParam('subtitles', filter.subtitleLanguageIds?.[0])
    setQueryParam('title', filter.title)

    void router.push(`/videos?${params.toString()}`, undefined, {
      shallow: true
    })

    void handleSearch({
      title,
      availableVariantLanguageIds,
      subtitleLanguageIds,
      page: 0
    })
  }

  function handleLoadMore(): void {
    const { title, availableVariantLanguageIds, subtitleLanguageIds } = filter
    if (isEnd) return
    void handleSearch({
      title,
      availableVariantLanguageIds,
      subtitleLanguageIds,
      page: currentPage + 1
    })
  }

  useEffect(() => {
    const { title, availableVariantLanguageIds, subtitleLanguageIds } = filter
    if (filterApplied)
      void handleSearch({
        title,
        availableVariantLanguageIds,
        subtitleLanguageIds,
        page: 0
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setIsEnd(isAtEnd(currentPage ?? 0, totalPages ?? 0))
  }, [setIsEnd, currentPage, totalPages])

  return (
    <PageWrapper hero={<VideosHero />} testId="VideosPage">
      <Container maxWidth="xxl">
        <VideosSubHero />
      </Container>
      <Divider sx={{ height: 2, background: 'rgba(33, 33, 33, 0.08)' }} />
      <Container maxWidth="xxl" sx={{ py: 12 }}>
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          spacing={{ xs: 4, xl: 8 }}
        >
          <Box sx={{ minWidth: '278px' }}>
            <FilterList
              filter={filter}
              onChange={handleFilterChange}
              languagesData={languagesData}
              languagesLoading={languagesLoading}
            />
          </Box>
          <Box sx={{ width: '100%' }}>
            <VideoGrid
              videos={filterApplied ? algoliaVideos : localVideos}
              onLoadMore={handleLoadMore}
              loading={loading}
              hasNextPage={!isEnd}
              variant="expanded"
            />
          </Box>
        </Stack>
      </Container>
    </PageWrapper>
  )
}
