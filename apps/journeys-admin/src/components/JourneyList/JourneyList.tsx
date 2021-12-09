import { ReactElement } from 'react'
import { Box, Typography, Link } from '@mui/material'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import JourneyCard from './JourneyCard'
export interface JourneysListProps {
  journeys: Journey[]
}

const JourneyList = ({ journeys }: JourneysListProps): ReactElement => {
  // const theme = useTheme()
  return (
    <>
      {journeys.length > 0 ? (
        <Box
          sx={{
            borderRadius: 3,
            outline: 'solid',
            outlineColor: '#DEDFE0', // theme.palette.surface.dark
            outlineWidth: 2,
            overflow: 'hidden'
          }}
        >
          {journeys.map((journey) => (
            <Box key={journey.id}>
              <Link underline="none" href={`/journeys/${journey.slug}`}>
                {/* The link will override cardMenu */}
                <JourneyCard journey={journey} />
              </Link>
            </Box>
          ))}
        </Box>
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
