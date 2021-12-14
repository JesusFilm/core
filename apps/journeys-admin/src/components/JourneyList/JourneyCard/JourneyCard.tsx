import { ReactElement } from 'react'
import { format, parseISO, isThisYear } from 'date-fns'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { Card, Typography, Box, Grid } from '@mui/material'
import Link from 'next/link'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import TranslateIcon from '@mui/icons-material/Translate'

import JourneyCardMenu from './JourneyCardMenu'

interface JourneyCardProps {
  journey: Journey
}

export function JourneyCard({ journey }: JourneyCardProps): ReactElement {
  const date = parseISO(journey.createdAt)
  const formattedDate = isThisYear(date)
    ? format(date, 'MMM do')
    : format(date, 'MMM do, yyyy')

  return (
    <Card sx={{ borderRadius: 0, px: 6, py: 4 }}>
      <Link href={`/journeys/${journey.slug}`} passHref>
        <Typography
          variant="subtitle1"
          component="div"
          noWrap
          gutterBottom
          sx={{ color: (theme) => theme.palette.secondary.main }}
        >
          {journey.title}
        </Typography>
      </Link>

      <Typography
        variant="caption"
        noWrap
        sx={{
          display: 'block',
          color: (theme) => theme.palette.secondary.main
        }}
        gutterBottom
      >
        {formattedDate}
        {journey.description !== null && ` - ${journey.description}`}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Grid container>
          <Grid item>
            {journey.status === 'draft' ? (
              <EditIcon
                color="warning"
                sx={{
                  pr: 2
                }}
              />
            ) : (
              <CheckCircleIcon
                color="success"
                sx={{
                  pr: 2
                }}
              />
            )}
          </Grid>
          <Grid item>
            <Typography
              variant="caption"
              sx={{ pr: 4, textTransform: 'capitalize' }}
            >
              {journey.status}
            </Typography>
          </Grid>
          <Grid item>
            <TranslateIcon
              sx={{
                pr: 2
              }}
            />
          </Grid>
          <Grid item>
            <Typography variant="caption">{journey.locale}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ marginLeft: 'auto' }}>
          <JourneyCardMenu status={journey.status} slug={journey.slug} />
        </Box>
      </Box>
    </Card>
  )
}
