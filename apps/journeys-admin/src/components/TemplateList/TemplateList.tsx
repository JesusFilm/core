import { NextRouter } from 'next/router'
import { ReactElement, useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import NewReleasesRounded from '@mui/icons-material/NewReleasesRounded'
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded'
import { AuthUser } from 'next-firebase-auth'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { SortOrder } from '../JourneyList/JourneySort'
import { StatusTabPanel } from '../StatusTabPanel'
import { ActiveTemplates } from './ActiveTemplates'
import { ArchivedTemplates } from './ArchivedTemplates'
import { TrashedTemplates } from './TrashedTemplates'

interface TemplateListProps {
  journeys?: Journey[]
  router?: NextRouter
  event: string | undefined
  authUser?: AuthUser
}

export function TemplateList({
  journeys,
  router,
  event,
  authUser
}: TemplateListProps): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const [activeTabLoaded, setActiveTabLoaded] = useState(false)
  const [activeEvent, setActiveEvent] = useState(event)

  useEffect(() => {
    setActiveEvent(event)
  }, [event])

  function activeTabOnLoad(): void {
    setActiveTabLoaded(true)
  }

  const journeyListProps = {
    onLoad: activeTabOnLoad,
    sortOrder: sortOrder,
    event: activeEvent,
    authUser: authUser
  }

  return (
    <Container sx={{ px: { xs: 0, sm: 8 } }}>
      {(journeys == null || journeys.length > 0) && (
        <StatusTabPanel
          activeList={<ActiveTemplates {...journeyListProps} />}
          archivedList={<ArchivedTemplates {...journeyListProps} />}
          trashedList={<TrashedTemplates {...journeyListProps} />}
          activeTabLoaded={activeTabLoaded}
          setActiveEvent={setActiveEvent}
          setSortOrder={setSortOrder}
          sortOrder={sortOrder}
          router={router}
        />
      )}
      {journeys?.length === 0 && (
        <Container maxWidth="sm" sx={{ mt: 20 }}>
          <Stack direction="column" spacing={8} alignItems="center">
            <NewReleasesRounded sx={{ fontSize: 60 }} />
            <Typography variant="h1" align="center">
              You need to be invited to create the first template
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
