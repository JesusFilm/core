import { ReactElement, useState } from 'react'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import { transformEvents, JourneyWithEvents, EventVariant } from '../utils'
import { TimelineEvent } from './TimelineEvent'
import { CompactEvent } from './CompactEvent'
import { GenericEvent } from './GenericEvent'

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
      sx={{ borderRadius: { xs: 0, sm: 4 }, mx: { xs: -6, sm: 0 }, mb: 6 }}
    >
      <Box sx={{ px: 6 }}>
        <GenericEvent
          duration={totalDuration}
          value={
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
            >
              <Typography variant="h3">{journey.title}</Typography>
              {journey.createdAt != null && (
                <Typography
                  variant="body2"
                  sx={{ ml: { xs: undefined, sm: 'auto' } }}
                >
                  {new Intl.DateTimeFormat([], {
                    dateStyle: 'long'
                  }).format(new Date(journey.createdAt))}
                </Typography>
              )}
            </Stack>
          }
          variant={EventVariant.title}
        />
      </Box>

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
