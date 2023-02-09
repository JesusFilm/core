import { ReactElement, useRef, useEffect } from 'react'
import { parseISO, isThisYear, intlFormat } from 'date-fns'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
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
import { ApolloQueryResult } from '@apollo/client'
import { GetActiveJourneys } from '../../../../__generated__/GetActiveJourneys'
import { GetArchivedJourneys } from '../../../../__generated__/GetArchivedJourneys'
import { GetTrashedJourneys } from '../../../../__generated__/GetTrashedJourneys'
import { GetJourneys_journeys as Journey } from '../../../../__generated__/GetJourneys'
import { AccessAvatars } from '../../AccessAvatars'
import { JourneyCardMenu } from './JourneyCardMenu'
import { StatusChip } from './StatusChip'

interface JourneyCardProps {
  journey?: Journey
  duplicatedJourneyId?: string
  refetch?: () => Promise<
    ApolloQueryResult<
      GetActiveJourneys | GetArchivedJourneys | GetTrashedJourneys
    >
  >
}

export function JourneyCard({
  journey,
  duplicatedJourneyId,
  refetch
}: JourneyCardProps): ReactElement {
  const duplicatedJourneyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (duplicatedJourneyId != null && duplicatedJourneyRef.current != null) {
      duplicatedJourneyRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [duplicatedJourneyId, journey])

  return (
    <Card
      ref={
        journey?.id === duplicatedJourneyId ? duplicatedJourneyRef : undefined
      }
      aria-label="journey-card"
      variant="outlined"
      sx={{
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        '&:last-of-type': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <>
        <Link href={journey != null ? `/journeys/${journey.id}` : ''} passHref>
          <CardActionArea>
            <CardContent
              sx={{
                px: 6,
                py: 4
              }}
            >
              {/* TODO: add badge */}
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
              {/* TODO: End */}
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
            pb: 4
          }}
        >
          <Stack direction="row" alignItems="center" spacing={4} flexGrow={1}>
            {/* TODO: show inviter avatar/ avatars requiring action */}
            <AccessAvatars
              journeyId={journey?.id}
              userJourneys={journey?.userJourneys ?? undefined}
            />
            {/* TODO: End */}
            {/* TODO: Update text */}
            {journey != null ? (
              <StatusChip status={journey.status} />
            ) : (
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <EditIcon sx={{ fontSize: 13 }} />
                <Typography variant="caption">
                  <Skeleton variant="text" width={30} />
                </Typography>
              </Stack>
            )}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <TranslateIcon sx={{ fontSize: 13 }} />
              <Typography variant="caption">
                {journey != null ? (
                  journey.language.name.find(({ primary }) => primary)?.value
                ) : (
                  <Skeleton variant="text" width={40} />
                )}
              </Typography>
            </Stack>
            {/* TODO: End */}
          </Stack>
          {journey != null ? (
            <JourneyCardMenu
              id={journey.id}
              status={journey.status}
              slug={journey.slug}
              published={journey.publishedAt != null}
              refetch={refetch}
            />
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
