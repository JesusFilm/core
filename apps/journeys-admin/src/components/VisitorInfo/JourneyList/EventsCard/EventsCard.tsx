import { ReactElement, useState } from 'react'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { transformEvents, JourneyWithEvents } from '../utils'
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

  const { timelineItems, totalDuration } = transformEvents(journey.events)

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 4, minHeight: '200px', mb: 6 }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', p: 5 }}>
        <Typography variant="body2" sx={{ pl: '52px', pr: '36px' }}>
          {totalDuration}
        </Typography>
        <Typography variant="h3">{journey.title}</Typography>
        {journey.createdAt != null && (
          <Typography variant="body2" sx={{ ml: 'auto', pr: 1 }}>
            {new Intl.DateTimeFormat([], {
              dateStyle: 'long'
            }).format(new Date(journey.createdAt))}
          </Typography>
        )}
      </Stack>

      <Divider />
      <Box sx={{ px: 6 }}>
        {timelineItems.map((timelineItem, index) => {
          if (Array.isArray(timelineItem)) {
            return (
              <>
                <Collapse
                  in={open}
                  collapsedSize={40}
                  sx={{
                    display: open ? 'none' : 'block'
                  }}
                >
                  <CompactEvent
                    key={index}
                    handleClick={handleOpen}
                    value={
                      timelineItem.length === 1
                        ? `${timelineItem.length} more event`
                        : `${timelineItem.length} more events`
                    }
                  />
                </Collapse>
                <Collapse in={open}>
                  {timelineItem.map((nestedEvent) => (
                    <TimelineEvent
                      key={nestedEvent.event.id}
                      timelineItem={nestedEvent}
                    />
                  ))}
                </Collapse>
              </>
            )
          } else {
            return (
              <TimelineEvent
                key={timelineItem.event.id}
                timelineItem={timelineItem}
              />
            )
          }
        })}
      </Box>
    </Card>
  )
}
