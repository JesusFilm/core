import { ReactElement } from 'react'
import moment from 'moment'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { Card, Chip, Typography, Box } from '@mui/material'
import JourneyCardMenu from './JourneyCardMenu'
import { AccessAvatars } from './AccessAvatars/AccessAvatars'
import { user1, user2, user3, user4 } from './AccessAvatars/AccessAvatarsData'

interface JourneyCardProps {
  journey: Journey
}

const JourneyCard = ({ journey }: JourneyCardProps): ReactElement => {
  const AccessAvatarsProps = { users: [user1, user2, user3] }

  // avatars styling, decrease size, ensure next chip is always same distance

  return (
    <Card sx={{ padding: '15px 29px' }}>
      {/* Update according to wireframe */}
      <Typography
        variant="subtitle1"
        sx={{
          display: 'block',
          // textOverflow: 'ellipsis',
          // wordWrap: 'break-word',
          overflow: 'hidden',
          maxHeight: '3.6em',
          lineHeight: '1.8em'
        }}
        gutterBottom
      >
        {journey.title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          display: 'block',
          // textOverflow: 'ellipsis',
          // wordWrap: 'break-word',
          overflow: 'hidden',
          maxHeight: '3.6em',
          lineHeight: '1.8em'
        }}
        gutterBottom
      >
        <b>{moment(journey.createdAt).format('MMMM Do')}</b> -{' '}
        {journey.description}
      </Typography>

      <Box sx={{ display: 'flex' }}>
        <AccessAvatars {...AccessAvatarsProps} />
        {/* <Chip label={journey.status} /> */}
        <Chip label={'Published'} sx={{ margin: '0px 10px' }} />
        <Chip
          label={journey.locale.substr(0, 2)}
          sx={{ marginRight: '10px' }}
        />
        <Box sx={{ marginLeft: 'auto' }}>
          <JourneyCardMenu />
        </Box>
      </Box>
    </Card>
  )
}

export default JourneyCard
