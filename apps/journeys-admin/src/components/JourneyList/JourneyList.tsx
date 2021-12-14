import { ReactElement, useState } from 'react'
import { Box } from '@mui/material'
import Link from 'next/link'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import JourneySort, { SortBy } from './JourneySort'
import JourneyCard from './JourneyCard'

export interface JourneysListProps {
  journeys: Journey[]
}

const JourneyList = ({ journeys }: JourneysListProps): ReactElement => {
  const [sortBy, setSortBy] = useState(SortBy.UNDEFINED)

  return (
    <>
      <JourneySort sortBy={sortBy} setSortBy={setSortBy} />
      {/* Remove this once we link journey cards to the Single Journey page */}
      {journeys.map((journey) => (
        <Box key={journey.id}>
          <Link href={`/journeys/${journey.slug}`} passHref>
            <JourneyCard journey={journey} />
          </Link>
        </Box>
      ))}
    </>
  )
}

export default JourneyList
