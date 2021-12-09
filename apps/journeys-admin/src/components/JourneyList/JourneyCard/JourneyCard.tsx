import { ReactElement } from 'react'
import moment from 'moment'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { Card, Typography, Box, Link, Grid } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import TranslateIcon from '@mui/icons-material/Translate'

import JourneyCardMenu from './JourneyCardMenu'

interface JourneyCardProps {
  journey: Journey
}

const JourneyCard = ({ journey }: JourneyCardProps): ReactElement => {
  const date =
    moment(journey.createdAt).format('YYYY') === moment().format('YYYY')
      ? moment(journey.createdAt).format('MMM Do')
      : moment(journey.createdAt).format('MMM Do, YYYY')

  return (
    <Card sx={{ borderRadius: '0px', px: 6, py: 4 }}>
      <Link href={`/journeys/${journey.slug}`} underline="none">
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
          variant="caption"
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
      </Link>

      <Box sx={{ display: 'flex' }}>
        <Grid container>
          <Grid item>
            {journey.status === 'draft' ? (
              <EditIcon
                sx={{
                  color: '#F0720C',
                  pr: '6px'
                }}
              />
            ) : (
              <CheckCircleIcon
                sx={{
                  color: '#3AA74A',
                  pr: '6px'
                }}
              />
            )}
          </Grid>
          <Grid item>
            <Typography variant="caption" sx={{ pr: 3 }}>
              Draft
            </Typography>
          </Grid>
          {/* Use locale helpers once its completed */}
          <Grid item>
            <TranslateIcon
              sx={{
                pr: '6px'
              }}
            />
          </Grid>
          <Grid item>
            <Typography variant="caption">{`${journey.locale
              .substring(0, 2)
              .toUpperCase()} (${journey.locale.substring(3)})`}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ marginLeft: 'auto' }}>
          <JourneyCardMenu status={journey.status} slug={journey.slug} />
        </Box>
      </Box>
    </Card>
  )
}

export default JourneyCard
