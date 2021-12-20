import { ReactElement, useState } from 'react'
import { Box, Card, Typography, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useBreakpoints } from '@core/shared/ui'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import JourneySort, { SortBy } from './JourneySort'
import { JourneyCard } from './JourneyCard'

export interface JourneysListProps {
  journeys: Journey[]
}

export function JourneyList({ journeys }: JourneysListProps): ReactElement {
  const breakpoints = useBreakpoints()
  const border = breakpoints.sm ? 3 : 0

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
      {journeys.length > 0 ? (
        <>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              mb: 6
            }}
          >
            <Typography variant={'h3'}>All Journeys</Typography>
            <JourneySort sortBy={sortBy} setSortBy={setSortBy} />
          </Box>
          <Card variant="outlined" sx={{ borderRadius: border }}>
            {journeys.map((journey, i) => {
              return (
                <Box
                  key={journey.id}
                  aria-label="journey-card"
                  sx={{
                    '&:first-child': { borderTop: 'none' },
                    borderTop: 1,
                    borderColor: 'divider'
                  }}
                >
                  <JourneyCard journey={journey} />
                </Box>
              )
            })}
          </Card>
        </>
      ) : (
        <Card
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            pt: 20,
            pb: 16,
            borderRadius: border
          }}
        >
          <Typography variant="subtitle1" align="center" gutterBottom>
            No journeys to display.
          </Typography>
          <Typography variant="caption" align="center" gutterBottom>
            Create a journey, then find it here.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="medium"
            sx={{
              mt: 3,
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
