import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { fakeJourneys } from './fakeData'
import { VisitorCard } from './VisitorCard'

interface Props {
  id: string
}

export function JourneyVisitorsList({ id }: Props): ReactElement {
  return (
    <Box sx={{ mx: { xs: -6, sm: 0 } }}>
      {fakeJourneys.map((journey) => (
        <VisitorCard key={journey.id} journey={journey} />
      ))}
    </Box>
  )
}
