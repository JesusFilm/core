import { ReactElement, useState, useEffect } from 'react'
import { NextRouter } from 'next/router'
import { AuthUser } from 'next-firebase-auth'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { MultipleSummaryReport } from '../MultipleSummaryReport'
import { StatusTabPanel } from '../StatusTabPanel'
import { ContactSupport } from '../ContactSupport'
import { AddJourneyButton } from './AddJourneyButton'
import { ActiveJourneyList } from './ActiveJourneyList'
import { ArchivedJourneyList } from './ArchivedJourneyList'
import { TrashedJourneyList } from './TrashedJourneyList'
import { SortOrder } from './JourneySort'

export interface JourneysListProps {
  journeys?: Journey[]
  router?: NextRouter
  event: string | undefined
  authUser?: AuthUser
}

export function JourneyList({
  journeys,
  router,
  event,
  authUser
}: JourneysListProps): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const [activeTabLoaded, setActiveTabLoaded] = useState(false)
  const [activeEvent, setActiveEvent] = useState(event)
  const { t } = useTranslation()
  const { journeysSummaryReport, inviteRequirement } = useFlags()

  useEffect(() => {
    setActiveEvent(event)
  }, [event])

  function activeTabOnLoad(): void {
    setActiveTabLoaded(true)
  }

  const journeyListProps = {
    onLoad: activeTabOnLoad,
    sortOrder,
    event: activeEvent,
    authUser
  }

  return (
    <>
      {journeys != null && journeys.length === 0 && inviteRequirement ? (
        <ContactSupport
          title={t('You need to be invited to use your first journey')}
          description={t(
            'Someone with a full account should add you to their journey as an editor, after that you will have full access'
          )}
        />
      ) : (
        <>
          {journeysSummaryReport && <MultipleSummaryReport />}
          <Box sx={{ mx: { xs: -6, sm: 0 } }}>
            <Container disableGutters>
              <StatusTabPanel
                activeList={<ActiveJourneyList {...journeyListProps} />}
                archivedList={<ArchivedJourneyList {...journeyListProps} />}
                trashedList={<TrashedJourneyList {...journeyListProps} />}
                activeTabLoaded={activeTabLoaded}
                setActiveEvent={setActiveEvent}
                setSortOrder={setSortOrder}
                sortOrder={sortOrder}
                router={router}
              />
            </Container>
          </Box>
          {!['archived', 'trashed'].includes(
            (router?.query?.tab as string) ?? ''
          ) && <AddJourneyButton variant="fab" />}
        </>
      )}
    </>
  )
}
