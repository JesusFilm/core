import { ReactElement } from 'react'
import { Card, Chip, Typography } from '@mui/material'
import { GetJourneys_journeys as Journey } from '../../../../../__generated__/GetJourneys'
import JourneyCardMenu from './JourneyCardMenu'
import { AccessAvatars } from './AccessAvatars'
import { user1, user2, user3 } from './AccessAvatars/AccessAvatarsData'

interface JourneyCardProps {
  journey: Journey
}

const JourneyCard = ({ journey }: JourneyCardProps): ReactElement => {
  const AccessAvatarsProps = {
    users: [user1, user2, user3]
  }

  return (
    <Card>
      {/* Update according to wireframe */}
      <Typography>{journey.title}</Typography>
      {/* <Typography>{journey.createdAt}</Typography> */}
      <Typography>{journey.description}</Typography>
      <AccessAvatars {...AccessAvatarsProps} />
      {/* <Chip label={journey.status }/> */}
      <Chip label={journey.locale.substr(0, 2)} />
      <JourneyCardMenu />
    </Card>
  )
}

export default JourneyCard
