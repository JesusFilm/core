import { ReactElement, useState } from 'react'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { transformEvents } from '../utils/transformEvents'
import { JourneyWithEvents } from '../utils/transformToJourney/transformToJourney'

interface Props {
  journey: JourneyWithEvents
}

export function EventsCard({ journey }: Props): ReactElement {
  const [open, setOpen] = useState(false)

  function handleOpen(): void {
    setOpen(!open)
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
            if (open) {
              return event.map((nestedEvent) => (
                <Typography key={nestedEvent.id}>
                  {nestedEvent.value}
                </Typography>
              ))
            } else {
              return <Typography key={index}>{event.length}</Typography>
            }
          } else {
            return <Typography key={event.id}>{event.value}</Typography>
          }
        })}
      </Box>
      <Button onClick={handleOpen}>Open</Button>
    </Card>
  )
}
