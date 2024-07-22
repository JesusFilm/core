import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { ThemeMode } from '@core/shared/ui/themes'

import { GetLanguages } from '../../../__generated__/GetLanguages'
import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import { Index } from 'react-instantsearch'
import { FilterList } from './FilterList'
import { VideosHero } from './Hero'
import { VideosSubHero } from './SubHero'
import { getQueryParameters } from './utils/getQueryParameters'
import type { VideoPageFilter } from './utils/getQueryParameters'
interface VideoProps {
  videos: VideoChildFields[]
}

// TODO:
// fix same data being returned - need to set up configuration properly
// fix urls

export function VideosPage({ videos }: VideoProps): ReactElement {
  const router = useRouter()

  const localVideos = videos.filter((video) => video != null)

  const { data: languagesData, loading: languagesLoading } =
    useQuery<GetLanguages>(GET_LANGUAGES, {
      variables: { languageId: '529' }
    })

  const filter = getQueryParameters()

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
  }

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
        <Index indexName="video-variants-stg">
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
              <VideoGrid videos={localVideos} variant="expanded" showLoadMore />
            </Box>
          </Stack>
        </Index>
      </Container>
    </PageWrapper>
  )
}
