import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import type {
  JourneyListEvent,
  JourneyListProps
} from '../JourneyList/JourneyList'
import { SortOrder } from '../JourneyList/JourneySort'
import { LoadingJourneyList } from '../JourneyList/LoadingJourneyList'
import { StatusTabPanel } from '../StatusTabPanel'

const ActiveTemplateList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ActiveTemplateList" */
      './ActiveTemplateList'
    ).then((mod) => mod.ActiveTemplateList),
  { loading: () => <LoadingJourneyList /> }
)

const ArchivedTemplateList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ArchivedTemplates" */
      './ArchivedTemplateList'
    ).then((mod) => mod.ArchivedTemplateList),
  { loading: () => <LoadingJourneyList /> }
)

const TrashedTemplateList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TrashedTemplateList" */
      './TrashedTemplateList'
    ).then((mod) => mod.TrashedTemplateList),
  { loading: () => <LoadingJourneyList /> }
)

export function TemplateList(): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
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
    <Box
      sx={{
        mx: { xs: 0, sm: 0 },
        mt: { xs: 0, sm: -5 }
      }}
      data-testid="JourneysAdminTemplateList"
    >
      <Container disableGutters>
        <StatusTabPanel
          activeList={<ActiveTemplateList {...journeyListProps} />}
          archivedList={<ArchivedTemplateList {...journeyListProps} />}
          trashedList={<TrashedTemplateList {...journeyListProps} />}
          setActiveEvent={handleClick}
          setSortOrder={setSortOrder}
          sortOrder={sortOrder}
        />
      </Container>
    </Box>
  )
}
