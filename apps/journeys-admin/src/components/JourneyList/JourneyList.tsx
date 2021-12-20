import { ReactElement } from 'react'
import { Box, Button } from '@mui/material'
import Link from 'next/link'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'

interface JourneysListProps {
  journeys: Journey[]
}

const JourneyList = ({ journeys }: JourneysListProps): ReactElement => {
  return (
    <>
      {/* Remove this once we link journey cards to the Single Journey page */}
      {journeys.map(({ title, slug }) => (
        <Box key={`slug-${slug}`} my={2}>
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
