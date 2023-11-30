import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { useRouter } from 'next/router'
import { User } from 'next-firebase-auth'
import { ReactElement, useState } from 'react'

import { StatusTabPanel } from '../StatusTabPanel'

import { ActiveJourneyList } from './ActiveJourneyList'
import { AddJourneyFab } from './AddJourneyFab'
import { ArchivedJourneyList } from './ArchivedJourneyList'
import { SortOrder } from './JourneySort'
import { TrashedJourneyList } from './TrashedJourneyList'

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

  return (
    <>
      <Box
        sx={{ mx: { xs: -6, sm: 0 } }}
        data-testid="JourneysAdminJourneyList"
      >
        <Container disableGutters>
          <StatusTabPanel
            activeList={<ActiveJourneyList {...journeyListProps} />}
            archivedList={<ArchivedJourneyList {...journeyListProps} />}
            trashedList={<TrashedJourneyList {...journeyListProps} />}
            setActiveEvent={handleClick}
            setSortOrder={setSortOrder}
            sortOrder={sortOrder}
          />
        </Container>
      </Box>
      {!['archived', 'trashed'].includes(
        router?.query?.tab?.toString() ?? ''
      ) && <AddJourneyFab />}
    </>
  )
}
