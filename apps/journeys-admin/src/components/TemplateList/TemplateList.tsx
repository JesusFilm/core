import { NextRouter } from 'next/router'
import { ReactElement, useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import { AuthUser } from 'next-firebase-auth'
import { SortOrder } from '../JourneyList/JourneySort'
import { StatusTabPanel } from '../StatusTabPanel'
import { ActiveTemplates } from './ActiveTemplates'
import { ArchivedTemplates } from './ArchivedTemplates'
import { TrashedTemplates } from './TrashedTemplates'

interface TemplateListProps {
  router?: NextRouter
  event: string | undefined
  authUser?: AuthUser
}

export function TemplateList({
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
    </Container>
  )
}
