import { ReactElement, useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import { NextRouter } from 'next/router'
import { AuthUser } from 'next-firebase-auth'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { MultipleSummaryReport } from '../MultipleSummaryReport'
import { StatusTabPanel } from '../StatusTabPanel'
import { AddJourneyButton } from './AddJourneyButton'
import { ActiveJourneyList } from './ActiveJourneyList'
import { ArchivedJourneyList } from './ArchivedJourneyList'
import { TrashedJourneyList } from './TrashedJourneyList'
import { SortOrder } from './JourneySort'
import { InviteRequirementMessage } from './InviteRequirementMessage'

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
        <InviteRequirementMessage />
      ) : (
        <>
          {journeysSummaryReport && <MultipleSummaryReport />}
          <Container sx={{ px: { xs: 0, sm: 8 } }}>
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
            {!['archived', 'trashed'].includes(
              (router?.query?.tab as string) ?? ''
            ) && <AddJourneyButton variant="fab" />}
          </Container>
        </>
      )}
    </>
  )
}
