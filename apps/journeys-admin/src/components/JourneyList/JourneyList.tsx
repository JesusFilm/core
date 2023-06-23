import { ReactElement, useState } from 'react'
import { useRouter } from 'next/router'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { MultipleSummaryReport } from '../MultipleSummaryReport'
import { StatusTabPanel } from '../StatusTabPanel'
import { AddJourneyFab } from './AddJourneyFab'
import { ActiveJourneyList } from './ActiveJourneyList'
import { ArchivedJourneyList } from './ArchivedJourneyList'
import { TrashedJourneyList } from './TrashedJourneyList'
import { SortOrder } from './JourneySort'

export interface JourneyListProps {
  sortOrder?: SortOrder
  event?: JourneyListEvent
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

export function JourneyList(): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const router = useRouter()
  const { journeysSummaryReport } = useFlags()
  const [event, setEvent] = useState<JourneyListEvent>()

  const handleClick = (event: JourneyListEvent): void => {
    setEvent(event)
    // remove event after component lifecycle
    setTimeout(() => {
      setEvent(undefined)
    }, 1000)
  }

  const journeyListProps: JourneyListProps = {
    sortOrder,
    event
  }

  return (
    <>
      {journeysSummaryReport && <MultipleSummaryReport />}
      <Box sx={{ mx: { xs: -6, sm: 0 } }}>
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
        router.query?.tab?.toString() ?? ''
      ) && <AddJourneyFab />}
    </>
  )
}
