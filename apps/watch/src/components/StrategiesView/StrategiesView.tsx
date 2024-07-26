import { SearchBar } from '@core/journeys/ui/SearchBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { ResourceHeading } from '../ResourceHeading'
import { StrategySections } from '../StrategySections'

export function StrategiesView(): ReactElement {
  return (
    <Box sx={{ backgroundColor: 'background.default' }}>
      <Container maxWidth="xxl">
        <Stack sx={{ pt: 6.5, gap: 10 }}>
          <ResourceHeading heading="Resource" />
          <SearchBar />
          <StrategySections index />
        </Stack>
      </Container>
    </Box>
  )
}
