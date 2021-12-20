import { ReactElement } from 'react'
import { Box, Button } from '@mui/material'
import Link from 'next/link'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'

interface JourneysListProps {
  journeys: Journey[]
}

export function JourneyList({ journeys }: JourneysListProps): ReactElement {
  return (
    <>
      {/* Remove this once we link journey cards to the Single Journey page */}
      {journeys.map(({ id, title, slug }) => (
        <Box key={id} my={2}>
          <Link href={`/journeys/${slug}`} passHref>
            <Button variant="contained" fullWidth>
              {title}
            </Button>
          </Link>
        </Box>
      ))}
    </>
  )
}
