import { ReactElement } from 'react'
import { Box, Card, Typography } from '@mui/material'

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
  let padding = '1px'
  return (
    <>
      {journeys.length > 0 ? (
        <Card
          sx={{
            borderRadius: border
          }}
        >
          {journeys.map((journey, i) => {
            padding = i === journeys.length - 1 ? '0px' : '1px'
            return (
              <Box key={journey.id} sx={{ pb: padding }}>
                <JourneyCard journey={journey} />
              </Box>
            )
          })}
        </Card>
      ) : (
        <Typography variant="h6" sx={{ textAlign: 'center' }}>
          No journeys
        </Typography>
      )}
    </>
  )
}

export default JourneyList
