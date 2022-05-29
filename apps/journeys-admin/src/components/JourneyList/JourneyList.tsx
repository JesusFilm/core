import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import NewReleasesRounded from '@mui/icons-material/NewReleasesRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import { sortBy } from 'lodash'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { AddJourneyButton } from './AddJourneyButton'
import { JourneySort, SortOrder } from './JourneySort'
import { JourneyCard } from './JourneyCard'

export interface JourneysListProps {
  journeys?: Journey[]
  disableCreation?: boolean
}

export function JourneyList({
  journeys,
  disableCreation
}: JourneysListProps): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()

  const sortedJourneys =
    sortOrder === SortOrder.TITLE
      ? sortBy(journeys, 'title')
      : sortBy(journeys, ({ createdAt }) =>
          new Date(createdAt).getTime()
        ).reverse()

  return (
    <Container sx={{ px: { xs: 0, sm: 8 } }}>
      {journeys != null && journeys.length > 0 && (
        <AddJourneyButton variant="fab" />
      )}
      {(journeys == null ||
        journeys.length > 0 ||
        disableCreation !== true) && (
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
      )}
      <Box sx={{ mb: { xs: 4, sm: 5 } }} data-testid="journey-list">
        {journeys != null ? (
          <>
            {sortedJourneys.map((journey) => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
            {sortedJourneys.length === 0 && disableCreation !== true && (
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
                <AddJourneyButton variant="button" />
              </Card>
            )}
          </>
        ) : (
          <>
            <JourneyCard />
            <JourneyCard />
            <JourneyCard />
            <JourneyCard />
          </>
        )}
      </Box>
      {journeys != null && journeys.length === 0 && disableCreation && (
        <Container maxWidth="sm" sx={{ mt: 20 }}>
          <Stack direction="column" spacing={8} alignItems="center">
            <NewReleasesRounded sx={{ fontSize: 60 }} />
            <Typography variant="h1" align="center">
              You need to be invited to create the first journey
            </Typography>
            <Typography variant="subtitle2" align="center">
              Someone with a full account should add you to their journey as an
              editor, after that you will have full access
            </Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<ContactSupportRounded />}
                size="medium"
                onClick={() => {
                  window.location.href = `mailto:support@nextstep.is?subject=Invite request for the NextStep builder`
                }}
              >
                Contact Support
              </Button>
            </Box>
          </Stack>
        </Container>
      )}
    </Container>
  )
}
