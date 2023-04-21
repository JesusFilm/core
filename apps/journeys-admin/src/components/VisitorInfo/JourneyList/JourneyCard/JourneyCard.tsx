import { ReactElement, useState } from 'react'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import { Journey } from '../JourneyList'
import { EventsList } from './EventsList'

interface Props {
  journey: Journey
}

export function JourneyCard({ journey }: Props): ReactElement {
  const [open, setOpen] = useState(false)

  function handleOpen(): void {
    setOpen(!open)
  }

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 4, minHeight: '200px', mb: 6 }}
    >
      <Typography sx={{ p: 6 }}>{journey.title}</Typography>
      <Divider />
      <EventsList events={journey.events} open={open} />
      <Button onClick={handleOpen}>Open</Button>
    </Card>
  )
}
