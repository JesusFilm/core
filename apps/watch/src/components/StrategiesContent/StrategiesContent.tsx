import { SearchBar } from '@core/journeys/ui/SearchBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { StrategySections } from '../StrategySections'

export function StrategiesContent(): ReactElement {
  // StrategySections
  // SearchBar
  return (
    <Stack data-testid="StrategiesContentStack" sx={{ p: 4, gap: 4 }}>
      <Container maxWidth="xxl">
        <SearchBar />
      </Container>
      <StrategySections />
    </Stack>
  )
}
