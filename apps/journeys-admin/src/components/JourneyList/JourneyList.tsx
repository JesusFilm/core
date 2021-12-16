import { ReactElement, useState } from 'react'
import { Box, Typography } from '@mui/material'
import Link from 'next/link'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import JourneySort, { SortBy } from './JourneySort'
import JourneyCard from './JourneyCard'
import JourneysAppBar from '../JourneysAppBar'

export interface JourneysListProps {
  journeys: Journey[]
}

const JourneyList = ({ journeys }: JourneysListProps): ReactElement => {
  const [sortBy, setSortBy] = useState(SortBy.UNDEFINED)

  if (sortBy === SortBy.TITLE) {
    journeys.sort((a, b) => {
      return a.title.localeCompare(b.title)
    })
  } else {
    journeys.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }

  return (
    <>
      <JourneysAppBar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          mx: 6,
          mt: 10
        }}
      >
        <Typography variant={'h3'}>All Journeys</Typography>
        <JourneySort sortBy={sortBy} setSortBy={setSortBy} />
      </Box>
      {/* Remove this once we link journey cards to the Single Journey page */}
      <Box sx={{ p: 6 }} data-testid="journey-list">
        {journeys.map((journey) => (
          <Box key={journey.id} data-testid={'journey-card'}>
            <Link href={`/journeys/${journey.slug}`} passHref>
              <JourneyCard journey={journey} />
            </Link>
          </Box>
        ))}
      </Box>
    </>
  )
}

export default JourneyList
