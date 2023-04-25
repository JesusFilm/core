import { ReactElement, useState } from 'react'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'
import { transformEvents } from '../utils/transformEvents'
import { JourneyWithEvents } from '../utils/transformToJourney/transformToJourney'
import { TimelineEvent } from '../TimelineEvent'
import { CompactEvent } from '../CompactEvent'

interface Props {
  journey: JourneyWithEvents
}

export function EventsCard({ journey }: Props): ReactElement {
  const [open, setOpen] = useState(false)

  function handleOpen(): void {
    setOpen(true)
  }

  const nestedEvents = transformEvents(journey.events)

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 4, minHeight: '200px', mb: 6 }}
    >
      <Typography sx={{ p: 6 }}>{journey.title}</Typography>
      <Divider />
      <Box sx={{ p: 6 }}>
        {nestedEvents.map((event, index) => {
          if (Array.isArray(event)) {
            return (
              <>
                <Collapse
                  in={open}
                  collapsedSize={60}
                  sx={{
                    display: open ? 'none' : 'block'
                  }}
                >
                  <CompactEvent
                    key={index}
                    handleClick={handleOpen}
                    value={`${event.length} more events`}
                  />
                </Collapse>
                <Collapse in={open}>
                  {event.map((nestedEvent) => (
                    <TimelineEvent key={nestedEvent.id} event={nestedEvent} />
                  ))}
                </Collapse>
              </>
            )
          } else {
            return <TimelineEvent key={event.id} event={event} />
          }
        })}
      </Box>
    </Card>
  )
}
