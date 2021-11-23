import { ReactElement } from 'react'
import { Card, Chip, Typography, Box } from '@mui/material'
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

  // createdAt, add formating

  return (
    <Card>
      <Box sx={{ margin: '15px 29px' }}>
        {/* Update according to wireframe */}
        <Typography variant="subtitle1">{journey.title}</Typography>

        <Box sx={{ display: 'flex', paddingBottom: '14px' }}>
          {/* <Typography>{journey.createdAt}</Typography> */}
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            October 1st
          </Typography>
          <Typography variant="body2">&nbsp;- {journey.description}</Typography>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <AccessAvatars {...AccessAvatarsProps} />
          {/* <Chip label={journey.status }/> */}
          <Chip label={'Published'} sx={{ margin: '0px 10px' }} />
          <Chip
            label={journey.locale.substr(0, 2)}
            sx={{ marginRight: '10px' }}
          />
          <Box sx={{ marginLeft: 'auto' }}>
            <JourneyCardMenu />
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default JourneyCard
