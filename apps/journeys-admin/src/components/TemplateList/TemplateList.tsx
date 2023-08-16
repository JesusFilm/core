import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { ReactElement, useState } from 'react'

import { JourneyListEvent, JourneyListProps } from '../JourneyList/JourneyList'
import { SortOrder } from '../JourneyList/JourneySort'
import { StatusTabPanel } from '../StatusTabPanel'

import { ActiveTemplates } from './ActiveTemplates'
import { ArchivedTemplates } from './ArchivedTemplates'
import { TrashedTemplates } from './TrashedTemplates'

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
    <Box sx={{ mx: { xs: -6, sm: 0 } }}>
      <Container disableGutters>
        <StatusTabPanel
          activeList={<ActiveTemplates {...journeyListProps} />}
          archivedList={<ArchivedTemplates {...journeyListProps} />}
          trashedList={<TrashedTemplates {...journeyListProps} />}
          setActiveEvent={handleClick}
          setSortOrder={setSortOrder}
          sortOrder={sortOrder}
        />
      </Container>
    </Box>
  )
}
