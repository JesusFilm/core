import { useQuery } from '@apollo/client/react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { type ReactElement } from 'react'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'
import { ThemeMode } from '@core/shared/ui/themes'

import type { GetLanguages } from '../../../__generated__/GetLanguages'
import { PageWrapper } from '../PageWrapper'
import { AlgoliaVideoGrid } from '../VideoGrid/AlgoliaVideoGrid'

import { FilterList } from './FilterList'
import { VideosHero } from './Hero'
import { VideosSubHero } from './SubHero'

export function VideosPage(): ReactElement {
  const { data: languagesData, loading: languagesLoading } =
    useQuery<GetLanguages>(GET_LANGUAGES, {
      variables: { languageId: '529' }
    })

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
              languagesData={languagesData}
              languagesLoading={languagesLoading}
            />
          </Box>
          <Box sx={{ width: '100%' }}>
            <AlgoliaVideoGrid variant="expanded" showLoadMore />
          </Box>
        </Stack>
      </Container>
    </PageWrapper>
  )
}
