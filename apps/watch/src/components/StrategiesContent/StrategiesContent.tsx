import { SearchBar } from '@core/journeys/ui/SearchBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { StrategySections } from '../StrategySections'

export function StrategiesContent(): ReactElement {
  // StrategySections
  // SearchBar

  // move strategysections box and container out to this component
  // create the "resource for every interaction"
  // tidy up other tests/stories
  return (
    <Box sx={{ backgroundColor: 'background.default' }}>
      {/*  resource for every interaction */}
      <Container maxWidth="xxl">
        <Stack sx={{ p: 4, gap: 4 }}>
          <SearchBar />
          <StrategySections />
        </Stack>
      </Container>
    </Box>
  )
}
