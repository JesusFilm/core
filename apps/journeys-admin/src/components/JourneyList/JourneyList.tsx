import { ReactElement } from 'react'
import { Box, Card, Typography, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useBreakpoints } from '@core/shared/ui'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import JourneyCard from './JourneyCard'

export interface JourneysListProps {
  journeys: Journey[]
}

export function JourneyList({ journeys }: JourneysListProps): ReactElement {
  const breakpoints = useBreakpoints()
  const border = breakpoints.md ? 3 : 0

  return (
    <>
      {journeys.length > 0 ? (
        <Card
          sx={{
            borderRadius: border
          }}
        >
          {journeys.map((journey, i) => {
            return (
              <Box
                key={journey.id}
                sx={{
                  pb: '1px',
                  '& .last-child': {
                    pb: 0
                  }
                }}
              >
                <JourneyCard journey={journey} />
              </Box>
            )
          })}
        </Card>
      ) : (
        <Card sx={{ display: 'flex', flexDirection: 'column', pt: 20, pb: 16 }}>
          <Typography variant="subtitle1" align="center" gutterBottom>
            No journeys to display.
          </Typography>
          <Typography variant="caption" align="center" gutterBottom>
            Create a journey, then find it here.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            color="primary"
            sx={{
              borderRadius: 3,
              mt: 3,
              width: '250px',
              alignSelf: 'center'
            }}
          >
            Create a Journey
          </Button>
        </Card>
      )}
    </>
  )
}
