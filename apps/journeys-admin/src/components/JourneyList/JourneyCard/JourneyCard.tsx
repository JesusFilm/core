import { ReactElement } from 'react'
import moment from 'moment'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { Card, Chip, Typography, Box } from '@mui/material'
import JourneyCardMenu from './JourneyCardMenu'
import { AccessAvatars } from './AccessAvatars/AccessAvatars'
import { user1, user2, user3 } from './AccessAvatars/AccessAvatarsData'

interface JourneyCardProps {
  journey: Journey
}

const JourneyCard = ({ journey }: JourneyCardProps): ReactElement => {
  const AccessAvatarsProps = { users: [user1, user2, user3] }
  // adding styling on avatar breaks the component

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
        <b>{moment(journey.createdAt).format('MMMM Do')}</b> {' - '}
        {journey.description}
      </Typography>

      <Box sx={{ display: 'flex' }}>
        <AccessAvatars {...AccessAvatarsProps} />
        {journey.status === 'draft' ? (
          <Chip
            label={'Draft'}
            sx={{
              margin: '0px 15px',
              height: '42px',
              width: 'auto',
              borderRadius: '18px',
              paddingRight: '23px',
              fontSize: '17px'
            }}
          />
        ) : (
          <Chip
            label={'Published'}
            sx={{
              margin: '0px 15px',
              height: '42px',
              width: 'auto',
              borderRadius: '18px',
              fontSize: '17px'
            }}
          />
        )}
        <Chip
          label={journey.locale.substr(0, 2).toUpperCase()}
          sx={{
            height: '42px',
            width: 'auto',
            borderRadius: '18px',
            fontSize: '17px'
          }}
        />
        <Box sx={{ marginLeft: 'auto' }}>
          <JourneyCardMenu />
        </Box>
      </Box>
    </Card>
  )
}

export default JourneyCard
