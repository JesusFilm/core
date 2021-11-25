import { ReactElement, useState } from 'react'
import { Box, Button } from '@mui/material'
import Link from 'next/link'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import JourneySort, { SortBy } from './JourneySort'

interface JourneysListProps {
  journeys: Journey[]
}

const JourneyList = ({ journeys }: JourneysListProps): ReactElement => {
  const [sortBy, setSortBy] = useState(SortBy.UNDEFINED)

  return (
    <>
      <JourneySort sortBy={sortBy} setSortBy={setSortBy} />
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

export default JourneyList
