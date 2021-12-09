import { ReactElement } from 'react'
import { Box, Typography } from '@mui/material'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import JourneyCard from './JourneyCard'
import { useBreakpoints } from '@core/shared/ui'
export interface JourneysListProps {
  journeys: Journey[]
}

const JourneyList = ({ journeys }: JourneysListProps): ReactElement => {
  // const theme = useTheme()
  const breakpoints = useBreakpoints()
  const border = breakpoints.md ? 3 : 0
  return (
    <>
      {journeys.length > 0 ? (
        <Box
          sx={{
            borderRadius: border,
            outline: 'solid',
            outlineColor: '#DEDFE0', // theme.palette.surface.dark
            outlineWidth: 1,
            overflow: 'hidden'
          }}
        >
          {journeys.map((journey) => (
            <Box key={journey.id}>
              <JourneyCard journey={journey} />
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          No journeys
        </Typography>
      )}
    </>
  )
}

export default JourneyList
