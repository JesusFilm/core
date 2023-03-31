import { gql, useQuery } from '@apollo/client'
import { ReactElement, useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { useLanguage } from '../../libs/languageContext/LanguageContext'
import { GetVideos } from '../../../__generated__/GetVideos'
import { VIDEO_CHILD_FIELDS } from '../../libs/videoChildFields'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid/VideoGrid'
import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { GetLanguages } from '../../../__generated__/GetLanguages'
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

interface VideosProps {
  videos: VideoChildFields[]
}

export interface VideoPageFilter {
  availableVariantLanguageIds?: string[]
  subtitleLanguageIds?: string[]
  title?: string
}

export function VideosPage({ videos }: VideosProps): ReactElement {
  const router = useRouter()
  const languageContext = useLanguage()
  const [isEnd, setIsEnd] = useState(false)
  const [previousCount, setPreviousCount] = useState(0)

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

  const { data, loading, fetchMore, refetch } = useQuery<GetVideos>(
    GET_VIDEOS,
    {
      variables: {
        where: filter,
        offset: 0,
        limit,
        languageId:
          filter.availableVariantLanguageIds?.[0] ??
          languageContext?.id ??
          '529'
      },
      notifyOnNetworkStatusChange: true
    }
  )

  function handleFilterChange(filter: VideoPageFilter): void {
    void refetch({
      where: filter,
      offset: 0,
      limit,
      languageId:
        filter.availableVariantLanguageIds?.[0] ?? languageContext?.id ?? '529'
    })
    const params = new URLSearchParams()
    if (filter.availableVariantLanguageIds != null)
      params.set('language', filter.availableVariantLanguageIds[0])
    if (filter.subtitleLanguageIds != null)
      params.set('subtitle', filter.subtitleLanguageIds[0])
    if (filter.title != null) params.set('title', filter.title)
    void router.push(`/videos?${params.toString()}`, undefined, {
      shallow: true
    })
  }

  const { data: languagesData, loading: languagesLoading } =
    useQuery<GetLanguages>(GET_LANGUAGES, {
      variables: { languageId: '529' }
    })

  useEffect(() => {
    setIsEnd(isAtEnd(data?.videos.length ?? 0, limit, previousCount))
  }, [data?.videos.length, setIsEnd, previousCount])

  const handleLoadMore = async (): Promise<void> => {
    if (isEnd) return

    setPreviousCount(data?.videos.length ?? 0)
    await fetchMore({
      variables: {
        offset: data?.videos.length ?? 0
      }
    })
  }

  return (
    <PageWrapper hero={<VideosHero />}>
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
              videos={
                data?.videos == null
                  ? loading
                    ? []
                    : videos
                  : data?.videos ?? []
              }
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
