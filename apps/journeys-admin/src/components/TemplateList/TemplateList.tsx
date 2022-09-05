import { NextRouter } from 'next/router'
import { ReactElement } from 'react'
// import { ReactElement, useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import { AuthUser } from 'next-firebase-auth'
// import { SortOrder } from '../JourneyList/JourneySort'
import { TemplateStatusTabs } from './TemplateStatusTabs'
// import { ActiveTemplates } from './TemplateStatusTabs/ActiveTemplates'
// import { ArchivedTemplates } from './TemplateStatusTabs/ArchivedTemplates'
// import { TrashedTemplates } from './TemplateStatusTabs/TrashedTemplates'

interface TemplateListProps {
  event: string | undefined
  router?: NextRouter
  authUser?: AuthUser
}

export function TemplateList({
  event,
  router,
  authUser
}: TemplateListProps): ReactElement {
  // const [sortOrder, setSortOrder] = useState<SortOrder>()
  // const [activeTabLoaded, setActiveTabLoaded] = useState(false)
  // const [activeEvent, setActiveEvent] = useState(event)

  // useEffect(() => {
  //   setActiveEvent(event)
  // }, [event])

  // function activeTabOnLoad(): void {
  //   setActiveTabLoaded(true)
  // }

  // const journeyListProps = {
  //   onLoad: activeTabOnLoad,
  //   sortOrder: sortOrder,
  //   event: activeEvent,
  //   authUser: authUser
  // }

  return (
    <Container sx={{ px: { xs: 0, sm: 8 } }}>
      {/* Remove */}
      <TemplateStatusTabs event={event} router={router} authUser={authUser} />
      {/* <StatusTabPanel
        activeList={<ActiveTemplates {...journeyListProps} />}
        archivedList={<ArchivedTemplates {...journeyListProps} />}
        trashedList={<TrashedTemplates {...journeyListProps} />}
        activeTabLoaded={activeTabLoaded}
        setActiveEvent={setActiveEvent}
        setSortOrder={setSortOrder}
        sortOrder={sortOrder}
        router={router}
      /> */}
    </Container>
  )
}
