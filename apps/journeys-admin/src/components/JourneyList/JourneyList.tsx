import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { ReactElement, Suspense, useState } from 'react'

import { DiscoveryJourneys } from '../DiscoveryJourneys'
import { StatusTabPanel } from '../StatusTabPanel'

import { AddJourneyFab } from './AddJourneyFab'
import { SortOrder } from './JourneySort'
import { LoadingJourneyList } from './LoadingJourneyList'

export interface JourneyListProps {
  sortOrder?: SortOrder
  event?: JourneyListEvent
  user?: User
}

export type JourneyListEvent =
  | 'archiveAllActive'
  | 'trashAllActive'
  | 'refetchActive'
  | 'restoreAllArchived'
  | 'trashAllArchived'
  | 'refetchArchived'
  | 'restoreAllTrashed'
  | 'deleteAllTrashed'
  | 'refetchTrashed'

const ActiveJourneyList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ActiveJourneyList" */
      './ActiveJourneyList'
    ).then((mod) => mod.ActiveJourneyList),
  { ssr: false, loading: LoadingJourneyList }
)

const ArchivedJourneyList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ArchivedJourneyList" */
      './ArchivedJourneyList'
    ).then((mod) => mod.ArchivedJourneyList),
  { ssr: false, loading: LoadingJourneyList }
)

const TrashedJourneyList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TrashedJourneyList" */
      './TrashedJourneyList'
    ).then((mod) => mod.TrashedJourneyList),
  { ssr: false, loading: LoadingJourneyList }
)

export function JourneyList({
  user
}: Pick<JourneyListProps, 'user'>): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const router = useRouter()
  const [event, setEvent] = useState<JourneyListEvent>()

  const handleClick = (event: JourneyListEvent): void => {
    setEvent(event)
    // remove event after component lifecycle
    setTimeout(() => {
      setEvent(undefined)
    }, 1000)
  }

  const journeyListProps: JourneyListProps = {
    user,
    sortOrder,
    event
  }

  const activeTab = router?.query?.tab?.toString() ?? 'active'

  return (
    <>
      <Box
        sx={{ mx: { xs: -6, sm: 0 } }}
        data-testid="JourneysAdminJourneyList"
      >
        <Container disableGutters>
          <StatusTabPanel
            activeList={
              <Suspense fallback={<LoadingJourneyList />}>
                <ActiveJourneyList {...journeyListProps} />
              </Suspense>
            }
            archivedList={
              <Suspense fallback={<LoadingJourneyList />}>
                <ArchivedJourneyList {...journeyListProps} />
              </Suspense>
            }
            trashedList={
              <Suspense fallback={<LoadingJourneyList />}>
                <TrashedJourneyList {...journeyListProps} />
              </Suspense>
            }
            setActiveEvent={handleClick}
            setSortOrder={setSortOrder}
            sortOrder={sortOrder}
          />
          <DiscoveryJourneys />
        </Container>
      </Box>
      {activeTab === 'active' && <AddJourneyFab />}
    </>
  )
}
