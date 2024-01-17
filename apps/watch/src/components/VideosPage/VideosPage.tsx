import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import {
  useInfiniteHits,
  useInstantSearch,
  useSearchBox
} from 'react-instantsearch'

import { GetLanguages } from '../../../__generated__/GetLanguages'
import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VIDEO_CHILD_FIELDS } from '../../libs/videoChildFields'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import { FilterList } from './FilterList'
import { VideosHero } from './Hero'
import { VideosSubHero } from './SubHero'

export const GET_VIDEOS = gql`
  ${VIDEO_CHILD_FIELDS}
  query GetVideos(
    $where: VideosFilter
    $offset: Int
    $limit: Int
    $languageId: ID
  ) {
    videos(where: $where, offset: $offset, limit: $limit) {
      ...VideoChildFields
    }
  }
`

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

export const limit = 20

export interface VideoPageFilter {
  ids?: string[]
  availableVariantLanguageIds?: string[]
  subtitleLanguageIds?: string[]
  title?: string
}

interface VideoProps {
  localVideos: VideoChildFields[]
}

export function VideosPage({ localVideos }: VideoProps): ReactElement {
  const router = useRouter()
  const { status } = useInstantSearch()
  const { query: algoliaQuery, refine } = useSearchBox()
  const {
    hits: algoliaVideos,
    isFirstPage,
    isLastPage,
    showPrevious,
    showMore
  } = useInfiniteHits()

  function convertAlgoliaVideos(videos): VideoChildFields[] {
    // title should default to english unless a user selects a language
    // variant should default to english unless a user selects a subtitle or language

    return videos.map((video) => ({
      ...video,
      title: [{ value: video.titles[0] }], // TODO: update when more titles
      imageAlt: [{ value: video.imageAlt }],
      snippet: [{ value: video.snippet }]
      // variant needs to be converted here
      // it needs to also update if a user sets a filter for language
    }))
  }
  const videos = convertAlgoliaVideos(algoliaVideos)

  const realVideos = localVideos.filter((video) => video !== null)

  // we intentionally use window.location.search to prevent multiple renders
  // which occurs when using const { query } = useRouter()
  const query = new URLSearchParams(
    typeof window !== 'undefined'
      ? window.location.search.split('?')[1]
      : undefined
  )

  const filter: VideoPageFilter = {
    availableVariantLanguageIds:
      query.get('language') != null
        ? [query.get('language') as string]
        : undefined,
    subtitleLanguageIds:
      query.get('subtitle') != null
        ? [query.get('subtitle') as string]
        : undefined,
    title:
      query.get('title') != null ? (query.get('title') as string) : undefined
  }

  function handleFilterChange(filter): void {
    const params = new URLSearchParams()

    const languages = filter.availableVariantLanguageIds
    const subtitles = filter.subtitleLanguageIds
    const title = filter.title

    if (languages != null) {
      params.set('languages', languages[0])
      refine(languages[0])
    }
    if (subtitles != null) {
      params.set('subtitles', subtitles[0])
      refine(subtitles[0])
    }
    if (title != null) {
      params.set('title', title)
      refine(title)
    }
    void router.push(`/videos?${params.toString()}`, undefined, {
      shallow: true
    })
  }

  const { data: languagesData, loading: languagesLoading } =
    useQuery<GetLanguages>(GET_LANGUAGES, {
      variables: { languageId: '529' }
    })

  const handleLoadMore = async (): Promise<void> => {
    if (isLastPage) return

    showMore()
  }

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
              videos={algoliaQuery !== '' ? videos : realVideos}
              onLoadMore={handleLoadMore}
              loading={status === 'loading' || status === 'stalled'}
              hasNextPage={!isLastPage}
              variant="expanded"
            />
          </Box>
        </Stack>
      </Container>
    </PageWrapper>
  )
}
