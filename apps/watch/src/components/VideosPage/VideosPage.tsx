import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { ThemeMode } from '@core/shared/ui/themes'

import { GetLanguages } from '../../../__generated__/GetLanguages'
import { PageWrapper } from '../PageWrapper'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import { Index } from 'react-instantsearch'
import { FilterList } from './FilterList'
import { VideosHero } from './Hero'
import { VideosSubHero } from './SubHero'
import { getQueryParameters } from './utils/getQueryParameters'

interface VideosPageProps {
  index?: boolean
}

export function VideosPage({ index = false }: VideosPageProps): ReactElement {
  const { data: languagesData, loading: languagesLoading } =
    useQuery<GetLanguages>(GET_LANGUAGES, {
      variables: { languageId: '529' }
    })

  const filter = getQueryParameters()

  const videosPageSegment: ReactNode = (
    <Stack direction={{ xs: 'column', xl: 'row' }} spacing={{ xs: 4, xl: 8 }}>
      <Box sx={{ minWidth: '278px' }}>
        <FilterList
          filter={filter}
          languagesData={languagesData}
          languagesLoading={languagesLoading}
        />
      </Box>
      <Box sx={{ width: '100%' }}>
        <VideoGrid variant="expanded" showLoadMore />
      </Box>
    </Stack>
  )

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
        {index ? (
          <Index indexName="video-variants-stg">{videosPageSegment}</Index>
        ) : (
          <>{videosPageSegment}</>
        )}
      </Container>
    </PageWrapper>
  )
}
