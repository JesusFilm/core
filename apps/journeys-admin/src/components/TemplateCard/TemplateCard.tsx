import { ReactElement, useRef, useEffect } from 'react'
import { parseISO, isThisYear, intlFormat } from 'date-fns'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import CardMedia from '@mui/material/CardMedia'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import EditIcon from '@mui/icons-material/Edit'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { ApolloQueryResult } from '@apollo/client'
import Link from 'next/link'
import { GetActivePublisherTemplates } from '../../../__generated__/GetActivePublisherTemplates'
import { GetArchivedPublisherTemplates } from '../../../__generated__/GetArchivedPublisherTemplates'
import { GetTrashedPublisherTemplates } from '../../../__generated__/GetTrashedPublisherTemplates'
import { GetPublishedTemplates_journeys as Journey } from '../../../__generated__/GetPublishedTemplates'
import { JourneyCardMenu } from '../JourneyList/JourneyCard/JourneyCardMenu'
import { StatusChip } from '../JourneyList/JourneyCard/StatusChip'

export interface TemplateCardProps {
  journey?: Journey
  isPublisher?: boolean
  duplicatedJourneyId?: string
  refetch?: () => Promise<
    ApolloQueryResult<
      | GetActivePublisherTemplates
      | GetArchivedPublisherTemplates
      | GetTrashedPublisherTemplates
    >
  >
}

export function TemplateCard({
  journey,
  isPublisher,
  duplicatedJourneyId,
  refetch
}: TemplateCardProps): ReactElement {
  const duplicatedJourneyRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (duplicatedJourneyId != null && duplicatedJourneyRef.current != null) {
      duplicatedJourneyRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [duplicatedJourneyId, journey])

  const nativeLanguage =
    journey?.language.name.find(({ primary }) => primary)?.value ?? ''
  const localLanguage = journey?.language.name.find(
    ({ primary }) => !primary
  )?.value
  const displayLanguage =
    nativeLanguage === localLanguage || localLanguage == null
      ? nativeLanguage
      : `${nativeLanguage} (${localLanguage})`

  const date =
    journey != null
      ? intlFormat(parseISO(journey.createdAt), {
          day: 'numeric',
          month: 'long',
          year: isThisYear(parseISO(journey?.createdAt)) ? undefined : 'numeric'
        })
      : ''

  return (
    <Card
      ref={
        journey?.id === duplicatedJourneyId ? duplicatedJourneyRef : undefined
      }
      aria-label="template-card"
      variant="outlined"
      sx={{
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        height: '129px',
        display: 'flex',
        '&:last-of-type': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        },
        '&:first-of-type':
          isPublisher !== true
            ? {
                borderTopLeftRadius: { xs: 0, sm: 12 },
                borderTopRightRadius: { xs: 0, sm: 12 }
              }
            : undefined
      }}
    >
      {journey?.primaryImageBlock?.src != null ? (
        <CardMedia
          component="img"
          image={journey.primaryImageBlock.src}
          height="129px"
          alt={journey.title}
          sx={{
            maxWidth: '129px',
            minWidth: '129px'
          }}
        />
      ) : (
        <CardMedia
          component="div"
          sx={{
            height: '129px',
            width: '129px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '129px',
            minWidth: '129px',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.default'
          }}
        >
          <InsertPhotoRoundedIcon />
        </CardMedia>
      )}

      <Stack
        direction="column"
        sx={{
          width: `calc(100% - 129px)`,
          display: 'flex'
        }}
      >
        <Link
          href={
            journey != null
              ? `/${isPublisher === true ? 'publisher' : 'templates'}/${
                  journey.id
                }`
              : ''
          }
          passHref
        >
          <CardActionArea>
            <CardContent>
              {journey != null ? (
                <>
                  <Typography variant="subtitle1" noWrap>
                    {journey.title}
                  </Typography>
                  <Typography variant="body2" noWrap sx={{ fontSize: 12 }}>
                    {date}
                    {journey?.description != null
                      ? ` - ${journey.description}`
                      : ''}
                  </Typography>
                </>
              ) : (
                <Box sx={{ height: '44px' }}>
                  <Skeleton variant="text" width={120} />
                  <Skeleton variant="text" width={150} />
                </Box>
              )}
            </CardContent>
          </CardActionArea>
        </Link>

        <CardActions sx={{ px: 4, py: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              mt: isPublisher !== true ? 2 : 0,
              display: 'flex',
              justifyContent: 'flex-start',
              width: '100%'
            }}
          >
            {isPublisher === true && (
              <Box sx={{ pr: 3, display: 'flex' }}>
                {journey != null ? (
                  <StatusChip status={journey.status} />
                ) : (
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <EditIcon sx={{ fontSize: '14px' }} />
                    <Skeleton variant="text" width={50} height={20} />
                  </Stack>
                )}
              </Box>
            )}

            {journey != null ? (
              <>
                <TranslateRoundedIcon sx={{ fontSize: 13, pl: 0 }} />
                <Typography variant="body2" noWrap sx={{ ml: 1 }}>
                  {displayLanguage}
                </Typography>
              </>
            ) : (
              <>
                <TranslateRoundedIcon sx={{ fontSize: 13, p: 0 }} />
                <Skeleton
                  variant="text"
                  width={50}
                  height={20}
                  sx={{ ml: 1, p: 0 }}
                />
              </>
            )}

            {isPublisher === true && (
              <Box sx={{ display: 'flex', ml: 'auto' }}>
                {journey != null ? (
                  <JourneyCardMenu
                    id={journey.id}
                    status={journey.status}
                    slug={journey.slug}
                    published={journey.publishedAt != null}
                    template
                    refetch={refetch}
                  />
                ) : (
                  <>
                    <IconButton disabled>
                      <MoreVertIcon />
                    </IconButton>
                  </>
                )}
              </Box>
            )}
          </Stack>
        </CardActions>
      </Stack>
    </Card>
  )
}
