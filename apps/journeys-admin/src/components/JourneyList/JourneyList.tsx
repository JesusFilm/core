import { ReactElement, useState } from 'react'
import { Box, Card, Typography, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { JourneySort, SortOrder } from './JourneySort'
import { JourneyCard } from './JourneyCard'
import { JourneysAppBar } from '../JourneysAppBar'
import { sortBy } from 'lodash'

export interface JourneysListProps {
  journeys: Journey[]
}

export function JourneyList({ journeys }: JourneysListProps): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()

  const sortedJourneys =
    sortOrder === SortOrder.TITLE
      ? sortBy(journeys, 'title')
      : sortBy(journeys, ({ createdAt }) =>
          new Date(createdAt).getTime()
        ).reverse()

  return (
    <>
      <JourneysAppBar variant="list" />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          m: 6,
          mt: { xs: 20, md: 24 }
        }}
      >
        <Typography variant="h3">All Journeys</Typography>
        <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
      </Box>
      <Box sx={{ m: { xs: 0, md: 6 } }} data-testid="journey-list">
        {sortedJourneys.map((journey) => (
          <JourneyCard key={journey.id} journey={journey} />
        ))}
        {sortedJourneys.length === 0 && (
          <Card
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              pt: 20,
              pb: 16,
              borderRadius: { xs: 0, md: 3 }
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
      </Box>
    </>
  )
}
