import { ReactElement } from 'react'
import { parseISO, isThisYear, intlFormat } from 'date-fns'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Link from 'next/link'
import EditIcon from '@mui/icons-material/Edit'
import TranslateIcon from '@mui/icons-material/Translate'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { AccessAvatars } from '../../AccessAvatars'
import { JourneyCardMenu } from './JourneyCardMenu'
import { StatusChip } from './StatusChip'

interface JourneyCardProps {
  journey?: Journey
}

export function JourneyCard({ journey }: JourneyCardProps): ReactElement {
  return (
    <Card
      aria-label="journey-card"
      variant="outlined"
      sx={{
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        '&:last-child': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <>
        <Link
          href={journey != null ? `/journeys/${journey.slug}` : ''}
          passHref
        >
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
                {journey != null ? (
                  journey.title
                ) : (
                  <Skeleton variant="text" width={200} />
                )}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  display: 'block',
                  color: 'secondary.main'
                }}
              >
                {journey != null ? (
                  intlFormat(parseISO(journey.createdAt), {
                    day: 'numeric',
                    month: 'long',
                    year: isThisYear(parseISO(journey.createdAt))
                      ? undefined
                      : 'numeric'
                  })
                ) : (
                  <Skeleton variant="text" width={120} />
                )}
                {journey?.description != null && ` - ${journey.description}`}
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
          <Grid
            container
            spacing={2}
            display="flex"
            alignItems="center"
            sx={{ mt: 0 }}
          >
            <Grid item sx={{ py: 2 }}>
              <AccessAvatars
                journeySlug={journey?.slug}
                userJourneys={journey?.userJourneys ?? undefined}
              />
            </Grid>
            {journey != null ? (
              <StatusChip status={journey.status} />
            ) : (
              <>
                <Grid item sx={{ py: 2 }}>
                  <EditIcon sx={{ fontSize: 13 }} />
                </Grid>
                <Grid item sx={{ pr: 2, py: 2 }}>
                  <Typography variant="caption">
                    <Skeleton variant="text" width={30} />
                  </Typography>
                </Grid>
              </>
            )}
            <Grid item sx={{ py: 2 }}>
              <TranslateIcon sx={{ fontSize: 13 }} />
            </Grid>
            <Grid item sx={{ py: 2 }}>
              <Typography variant="caption">
                {journey != null ? (
                  journey.language.name.find(({ primary }) => primary)?.value
                ) : (
                  <Skeleton variant="text" width={40} />
                )}
              </Typography>
            </Grid>
          </Grid>
          {journey != null ? (
            <JourneyCardMenu status={journey.status} slug={journey.slug} />
          ) : (
            <IconButton disabled>
              <MoreVertIcon />
            </IconButton>
          )}
        </CardActions>
      </>
    </Card>
  )
}
