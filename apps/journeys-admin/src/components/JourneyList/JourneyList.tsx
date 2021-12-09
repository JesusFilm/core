import { ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import Link from 'next/link'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import JourneyCard from './JourneyCard'

export interface JourneysListProps {
  journeys: Journey[]
}

const JourneyList = ({ journeys }: JourneysListProps): ReactElement => {
  return (
    <>
      {journeys.length > 0 ? (
        journeys.map((journey) => (
          <Box key={journey.id}>
            <Link href={`/journeys/${journey.slug}`} passHref>
              <JourneyCard journey={journey} />
            </Link>
          </Box>
        ))
      ) : (
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          No journeys
        </Typography>
      )}
      {/* Remove this once we link journey cards to the Single Journey page */}
    </>
  )
}

export default JourneyList
