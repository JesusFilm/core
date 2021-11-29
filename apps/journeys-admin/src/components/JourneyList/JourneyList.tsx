import { ReactElement } from 'react'
import { Box } from '@mui/material'
import Link from 'next/link'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import JourneyCard from './JourneyCard'

interface JourneysListProps {
  journeys: Journey[]
}

const JourneyList = ({ journeys }: JourneysListProps): ReactElement => {
  return (
    <>
      {/* Remove this once we link journey cards to the Single Journey page */}
      {journeys.map((journey) => (
        <Box key={journey.id} my={2}>
          <Link href={`/journeys/${journey.slug}`} passHref>
            <JourneyCard journey={journey} />
          </Link>
        </Box>
      ))}
    </>
  )
}

export default JourneyList
