import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import NewReleasesRounded from '@mui/icons-material/NewReleasesRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import { NextRouter } from 'next/router'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { MultipleSummaryReport } from '../MultipleSummaryReport'
import { AddJourneyButton } from './AddJourneyButton'
import { StatusTabPanel } from './StatusTabPanel'

export interface JourneysListProps {
  journeys?: Journey[]
  disableCreation?: boolean
  router?: NextRouter
}

export function JourneyList({
  journeys,
  disableCreation,
  router
}: JourneysListProps): ReactElement {
  const { reports } = useFlags()

  return (
    <>
      {(journeys == null || journeys.length > 0 || disableCreation !== true) &&
        reports && <MultipleSummaryReport />}
      <Container sx={{ px: { xs: 0, sm: 8 } }}>
        {journeys != null &&
          journeys.length > 0 &&
          !['archived', 'trashed'].includes(
            (router?.query?.tab as string) ?? ''
          ) && <AddJourneyButton variant="fab" />}
        {(journeys == null ||
          journeys.length > 0 ||
          disableCreation !== true) && <StatusTabPanel router={router} />}
        {journeys != null && journeys.length === 0 && disableCreation && (
          <Container maxWidth="sm" sx={{ mt: 20 }}>
            <Stack direction="column" spacing={8} alignItems="center">
              <NewReleasesRounded sx={{ fontSize: 60 }} />
              <Typography variant="h1" align="center">
                You need to be invited to create the first journey
              </Typography>
              <Typography variant="subtitle2" align="center">
                Someone with a full account should add you to their journey as
                an editor, after that you will have full access
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
    </>
  )
}
