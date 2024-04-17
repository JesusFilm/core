import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import type {
  JourneyListEvent,
  JourneyListProps
} from '../JourneyList/JourneyList'
import { SortOrder } from '../JourneyList/JourneySort'
import { StatusTabPanel } from '../StatusTabPanel'

import { LoadingTemplateList } from './LoadingTemplateList'

const ActiveTemplateList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ActiveTemplateList" */
      './ActiveTemplateList'
    ).then((mod) => mod.ActiveTemplateList),
  { loading: () => <LoadingTemplateList /> }
)

const ArchivedTemplateList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "ArchivedTemplates" */
      './ArchivedTemplateList'
    ).then((mod) => mod.ArchivedTemplateList),
  { loading: () => <LoadingTemplateList /> }
)

const TrashedTemplateList = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TrashedTemplateList" */
      './TrashedTemplateList'
    ).then((mod) => mod.TrashedTemplateList),
  { loading: () => <LoadingTemplateList /> }
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
    <Box sx={{ mx: { xs: -6, sm: 0 } }} data-testid="JourneysAdminTemplateList">
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
