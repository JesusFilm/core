import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import AddIcon from '@mui/icons-material/Add'
import { sortBy } from 'lodash'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { AddJourneyFab } from '../AddJourneyFab'
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
    <Container sx={{ px: { xs: 0, sm: 8 } }}>
      <AddJourneyFab />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        sx={{
          mx: { xs: 6, sm: 0 },
          mt: { xs: 5, sm: 10 },
          mb: { xs: 4, sm: 5 }
        }}
      >
        <Typography variant="h3">All Journeys</Typography>
        <Box>
          <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
        </Box>
      </Stack>
      <Box sx={{ mb: { xs: 4, sm: 5 } }} data-testid="journey-list">
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
              borderRadius: { xs: 0, sm: 3 }
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
    </Container>
  )
}
