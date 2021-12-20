import { ReactElement } from 'react'
import { parseISO, isThisYear, intlFormat } from 'date-fns'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { Card, Typography, Box, Grid } from '@mui/material'
import { useBreakpoints } from '@core/shared/ui'
import Link from 'next/link'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import TranslateIcon from '@mui/icons-material/Translate'

import { JourneyCardMenu } from './JourneyCardMenu'

interface JourneyCardProps {
  journey: Journey
}

export function JourneyCard({ journey }: JourneyCardProps): ReactElement {
  const date = parseISO(journey.createdAt)
  const formattedDate = intlFormat(date, {
    day: 'numeric',
    month: 'long',
    year: isThisYear(date) ? undefined : 'numeric'
  })

  const breakpoints = useBreakpoints()
  const border = breakpoints.sm ? 12 : 0

  return (
    <Card
      aria-label="journey-card"
      variant="outlined"
      sx={{
        px: 6,
        py: 4,
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        '&:first-child': {
          borderTopLeftRadius: border,
          borderTopRightRadius: border
        },
        '&:last-child': {
          borderBottomLeftRadius: border,
          borderBottomRightRadius: border,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <Link href={`/journeys/${journey.slug}`} passHref>
        <Typography
          variant="subtitle1"
          component="div"
          noWrap
          gutterBottom
          sx={{ color: 'secondary.main' }}
        >
          {journey.title}
        </Typography>
      </Link>

      <Typography
        variant="caption"
        noWrap
        sx={{
          display: 'block',
          color: 'secondary.main'
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
