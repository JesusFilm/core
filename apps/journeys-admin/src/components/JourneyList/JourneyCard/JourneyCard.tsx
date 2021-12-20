import { ReactElement } from 'react'
import { Card, Chip, Typography } from '@mui/material'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { JourneyCardMenu } from './JourneyCardMenu'

interface JourneyCardProps {
  journey: Journey
}

export function JourneyCard({ journey }: JourneyCardProps): ReactElement {
  return (
    <Card>
      {/* Update according to wireframe */}
      <Typography>{journey.title}</Typography>
      {/* <Typography>{journey.createdAt}</Typography> */}
      <Typography>{journey.description}</Typography>
      {/* AccessAvatars */}
      {/* <Chip label={journey.status }/> */}
      <Chip label={journey.locale.substr(0, 2)} />
      <JourneyCardMenu />
    </Card>
  )
}
