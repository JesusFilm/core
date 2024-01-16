import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
import { useInfiniteHits, useSearchBox } from 'react-instantsearch'

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

function isAtEnd(count: number, limit: number, previousCount: number): boolean {
  if (count === previousCount) return true
  return count % limit !== 0
}

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
  // const languageContext = useLanguage()
  // const [isEnd, setIsEnd] = useState(false)
  // const [previousCount, setPreviousCount] = useState(0)
  const { query: algoliaQuery, refine } = useSearchBox()
  const { hits: algoliaVideos } = useInfiniteHits()

  // we intentionally use window.location.search to prevent multiple renders
  // which occurs when using const { query } = useRouter()
  const query = new URLSearchParams(
    typeof window !== 'undefined'
      ? window.location.search.split('?')[1]
      : undefined
  )

  function handleFilterChange(filter): void {
    refine(filter.title)

    const params = new URLSearchParams()
    if (filter.availableVariantLanguageIds != null)
      params.set('language', filter.availableVariantLanguageIds[0])
    if (filter.subtitleLanguageIds != null) {
      params.set('subtitle', filter.subtitleLanguageIds[0])
    }

    if (filter.title != null) {
      params.set('title', filter.title)
      refine(filter.title)
    }
    void router.push(`/videos?${params.toString()}`, undefined, {
      shallow: true
    })
  }

  const { data: languagesData, loading: languagesLoading } =
    useQuery<GetLanguages>(GET_LANGUAGES, {
      variables: { languageId: '529' }
    })

  function convertAlgoliaVideos(videos): VideoChildFields[] {
    return videos.map((video) => ({
      ...video,
      title: [{ value: video.titles[0] }], // TODO: update when more titles
      imageAlt: [{ value: video.imageAlt }],
      snippet: [{ value: video.snippet }]
    }))
  }
  const videos = convertAlgoliaVideos(algoliaVideos)

  // add realvideos check

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
              // filter={filter}
              onChange={handleFilterChange}
              languagesData={languagesData}
              languagesLoading={languagesLoading}
            />
          </Box>
          <Box sx={{ width: '100%' }}>
            <VideoGrid
              videos={algoliaQuery !== '' ? videos : localVideos}
              // onLoadMore={handleLoadMore}
              // loading={loading}
              // hasNextPage={!isEnd}
              variant="expanded"
            />
          </Box>
        </Stack>
      </Container>
    </PageWrapper>
  )
}
