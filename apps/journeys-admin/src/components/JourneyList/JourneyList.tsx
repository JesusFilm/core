import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import AddIcon from '@mui/icons-material/Add'
import { sortBy } from 'lodash'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { JourneysAppBar } from '../JourneysAppBar'
import { JourneySort, SortOrder } from './JourneySort'
import { JourneyCard } from './JourneyCard'

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
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          m: 6
        }}
      >
        <Typography variant="h3">All Journeys</Typography>
        <Box>
          <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
        </Box>
      </Stack>
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
