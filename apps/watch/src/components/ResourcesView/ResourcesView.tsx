import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { ResourceHeading } from '@core/journeys/ui/ResourceHeading'
import { SearchBar } from '@core/journeys/ui/SearchBar'

import { PageWrapper } from '../PageWrapper'

import { ResourceSections } from './ResourceSections'

export function ResourcesView(): ReactElement {
  return (
    <PageWrapper sx={{ overflowX: 'clip' }}>
      <Container maxWidth="xxl" sx={{ px: { xs: 0 }, py: { xs: 6, sm: 9 } }}>
        <Stack sx={{ p: 0, gap: 10 }}>
          <ResourceHeading heading="Resources" />
          <SearchBar />
          <ResourceSections includeIndex />
        </Stack>
      </Container>
    </PageWrapper>
  )
}
