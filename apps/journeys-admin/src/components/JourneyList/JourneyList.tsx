import Box from '@mui/material/Box'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { ReactElement, useEffect, useState } from 'react'

import { JourneyStatus } from '../../../__generated__/globalTypes'
import { useAdminJourneysQuery } from '../../libs/useAdminJourneysQuery'
import { usePageWrapperStyles } from '../PageWrapper/utils/usePageWrapperStyles'
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
  { loading: () => <LoadingJourneyList /> }
)

const ArchivedJourneyList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ArchivedJourneyList" */
      './ArchivedJourneyList'
    ).then((mod) => mod.ArchivedJourneyList),
  { loading: () => <LoadingJourneyList /> }
)

const TrashedJourneyList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TrashedJourneyList" */
      './TrashedJourneyList'
    ).then((mod) => mod.TrashedJourneyList),
  { loading: () => <LoadingJourneyList /> }
)

export function JourneyList({
  user
}: Pick<JourneyListProps, 'user'>): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const router = useRouter()
  const [event, setEvent] = useState<JourneyListEvent>()
  const { refetch } = useAdminJourneysQuery({
    status: [JourneyStatus.draft, JourneyStatus.published],
    useLastActiveTeamId: true
  })
  const { navbar, sidePanel } = usePageWrapperStyles()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // for updating journey list cache for shallow loading
      if (url === '/' || url === '/publisher') {
        void refetch()
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [refetch, router.events])

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
        sx={{
          mt: { xs: 0, sm: -5 },
          width: {
            sm: '100%',
            md: `calc(100vw - ${sidePanel.width} - ${navbar.width} - 80px)`
          }
        }}
        data-testid="JourneysAdminJourneyList"
      >
        <StatusTabPanel
          activeList={<ActiveJourneyList {...journeyListProps} />}
          archivedList={<ArchivedJourneyList {...journeyListProps} />}
          trashedList={<TrashedJourneyList {...journeyListProps} />}
          setActiveEvent={handleClick}
          setSortOrder={setSortOrder}
          sortOrder={sortOrder}
        />
      </Box>
      {activeTab === 'active' && <AddJourneyFab />}
    </>
  )
}
