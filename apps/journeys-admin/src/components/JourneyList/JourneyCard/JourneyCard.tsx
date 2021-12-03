import { ReactElement } from 'react'
import moment from 'moment'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { Card, Chip, Typography, Box } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import TranslateIcon from '@mui/icons-material/Translate'

import JourneyCardMenu from './JourneyCardMenu'
import { AccessAvatars } from './AccessAvatars/AccessAvatars'
import { user1, user2, user3 } from './AccessAvatars/AccessAvatarsData'

interface JourneyCardProps {
  journey: Journey
}

const JourneyCard = ({ journey }: JourneyCardProps): ReactElement => {
  const AccessAvatarsProps = { users: [user1, user2, user3] }
  const date =
    moment(journey.createdAt).format('YYYY') === moment().format('YYYY')
      ? moment(journey.createdAt).format('MMM Do')
      : moment(journey.createdAt).format('MMM Do, YYYY')

  return (
    <Card sx={{ borderRadius: '0px', px: 6, py: 4 }} variant="outlined">
      <Typography
        variant="subtitle1"
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
        gutterBottom
      >
        {journey.title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
        gutterBottom
      >
        {date}
        {journey.description !== null && ` - ${journey.description}`}
      </Typography>

      <Box sx={{ display: 'flex' }}>
        <AccessAvatars {...AccessAvatarsProps} />
        {journey.status === 'draft' ? (
          <Chip
            label={'Draft'}
            icon={<EditIcon style={{ color: '#F0720C' }} />}
            sx={{
              height: '42px',
              width: 'auto',
              borderRadius: '18px',
              fontSize: '17px',
              backgroundColor: 'white',
              ml: 4
            }}
          />
        ) : (
          <Chip
            label={'Published'}
            icon={<CheckCircleIcon style={{ color: '#3AA74A' }} />}
            sx={{
              height: '42px',
              width: 'auto',
              borderRadius: '18px',
              fontSize: '17px',
              backgroundColor: 'white',
              ml: 4
            }}
          />
        )}
        <Chip
          label={`${journey.locale
            .substring(0, 2)
            .toUpperCase()} (${journey.locale.substring(3)})`}
          icon={<TranslateIcon />}
          sx={{
            height: '42px',
            width: 'auto',
            borderRadius: '18px',
            fontSize: '17px',
            backgroundColor: 'white',
            ml: 4
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
