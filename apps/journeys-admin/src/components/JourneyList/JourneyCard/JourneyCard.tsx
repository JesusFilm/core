import { ReactElement } from 'react'
import { parseISO, isThisYear, intlFormat } from 'date-fns'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Link from 'next/link'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EditIcon from '@mui/icons-material/Edit'
import TranslateIcon from '@mui/icons-material/Translate'
import { AuthUser } from 'next-firebase-auth'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { AccessAvatars } from '../../AccessAvatars'
import { JourneyCardMenu } from './JourneyCardMenu'

interface JourneyCardProps {
  journey: Journey
  AuthUser?: AuthUser
}

export function JourneyCard({
  journey,
  AuthUser
}: JourneyCardProps): ReactElement {
  const date = parseISO(journey.createdAt)
  const formattedDate = intlFormat(date, {
    day: 'numeric',
    month: 'long',
    year: isThisYear(date) ? undefined : 'numeric'
  })

  return (
    <Card
      aria-label="journey-card"
      variant="outlined"
      sx={{
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        '&:first-of-type': {
          borderTopLeftRadius: { xs: 0, sm: 12 },
          borderTopRightRadius: { xs: 0, sm: 12 }
        },
        '&:last-child': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <Link href={`/journeys/${journey.slug}`} passHref>
        <CardActionArea>
          <CardContent
            sx={{
              px: 6,
              py: 4
            }}
          >
            <Typography
              variant="subtitle1"
              component="div"
              noWrap
              gutterBottom
              sx={{ color: 'secondary.main' }}
            >
              {journey.title}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{
                display: 'block',
                color: 'secondary.main'
              }}
            >
              {formattedDate}
              {journey.description !== null && ` - ${journey.description}`}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Link>
      <CardActions
        sx={{
          px: 6,
          pt: 0,
          pb: 4
        }}
      >
        <Grid container spacing={2} display="flex" alignItems="center">
          <Grid item>
            {journey.userJourneys != null && (
              <AccessAvatars
                AuthUser={AuthUser}
                journeySlug={journey.slug}
                userJourneys={journey.userJourneys}
              />
            )}
          </Grid>

          {journey.status === 'draft' ? (
            <>
              <Grid item display="flex" alignItems="center">
                <EditIcon color="warning" sx={{ fontSize: 13 }} />
              </Grid>
              <Grid item>
                <Typography variant="caption" sx={{ pr: 2 }}>
                  Draft
                </Typography>
              </Grid>
            </>
          ) : (
            <>
              <Grid item display="flex" alignItems="center">
                <CheckCircleIcon color="success" sx={{ fontSize: 13 }} />
              </Grid>
              <Grid item>
                <Typography variant="caption" sx={{ pr: 2 }}>
                  Published
                </Typography>
              </Grid>
            </>
          )}
          <Grid item display="flex" alignItems="center">
            <TranslateIcon sx={{ fontSize: 13 }} />
          </Grid>
          <Grid item>
            <Typography variant="caption">{journey.locale}</Typography>
          </Grid>
        </Grid>
        <JourneyCardMenu status={journey.status} slug={journey.slug} />
      </CardActions>
    </Card>
  )
}
