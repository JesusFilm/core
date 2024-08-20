import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement, useEffect } from 'react'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { ThemeMode } from '@core/shared/ui/themes'

import { GetLanguages } from '../../../__generated__/GetLanguages'
import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import { FilterList } from './FilterList'
import { VideosHero } from './Hero'
import { VideosSubHero } from './SubHero'
import { checkFilterApplied } from './utils/checkFilterApplied'
import { getQueryParameters } from './utils/getQueryParameters'
import type { VideoPageFilter } from './utils/getQueryParameters'
import { useVideoSearch } from './utils/useVideoSearch'

interface VideoProps {
  videos: VideoChildFields[]
}

export function VideosPage({ videos }: VideoProps): ReactElement {
  const router = useRouter()

  const localVideos = videos.filter((video) => video != null)

  const { data: languagesData, loading: languagesLoading } =
    useQuery<GetLanguages>(GET_LANGUAGES, {
      variables: { languageId: '529' }
    })

  const filter = getQueryParameters()

  const { algoliaVideos, isEnd, loading, handleSearch, handleLoadMore } =
    useVideoSearch({ filter })

  function handleFilterChange(filter: VideoPageFilter): void {
    const params = new URLSearchParams()

    const setQueryParam = (paramName: string, value?: string | null): void => {
      if (value != null) {
        params.set(paramName, value)
      }
    }

    setQueryParam('languages', filter.availableVariantLanguageIds?.[0])
    setQueryParam('subtitles', filter.subtitleLanguageIds?.[0])
    setQueryParam('title', filter.title)

    void router.push(`/watch/videos?${params.toString()}`, undefined, {
      shallow: true
    })
    void handleSearch(filter, 0)
  }

  useEffect(() => {
    const { title, availableVariantLanguageIds, subtitleLanguageIds } = filter
    if (checkFilterApplied(filter)) {
      void handleSearch(
        {
          title,
          availableVariantLanguageIds,
          subtitleLanguageIds
        },
        0
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageWrapper
      hero={<VideosHero />}
      testId="VideosPage"
      headerThemeMode={ThemeMode.dark}
      hideHeaderSpacer
    >
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
                algoliaVideos.length === 0 && !checkFilterApplied(filter)
                  ? localVideos
                  : algoliaVideos
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
