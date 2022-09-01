import { ReactElement } from 'react'
import { parseISO, isThisYear, intlFormat } from 'date-fns'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import CardMedia from '@mui/material/CardMedia'
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded'
import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import EditIcon from '@mui/icons-material/Edit'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Link from 'next/link'
import { GetPublishedTemplates_journeys as Journey } from '../../../__generated__/GetPublishedTemplates'
import { JourneyCardMenu } from '../JourneyList/JourneyCard/JourneyCardMenu'
import { StatusChip } from '../JourneyList/JourneyCard/StatusChip'

export interface TemplateCardProps {
  journey?: Journey
  admin?: boolean // activates publisher version of template cards
}

export function TemplateCard({
  journey,
  admin
}: TemplateCardProps): ReactElement {
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
          admin !== true
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
            borderColor: 'divider'
          }}
        >
          <InsertPhotoRoundedIcon />
        </CardMedia>
      )}

      <Link
        href={
          journey != null
            ? `/${admin === true ? 'templates' : 'library'}/${journey.id}`
            : ''
        }
        passHref
      >
        <CardActionArea sx={{ flexGrow: 1, width: '42%' }}>
          <CardContent>
            {journey != null ? (
              <>
                <Typography variant="subtitle1" noWrap>
                  {journey.title}
                </Typography>
                <Typography variant="body2" noWrap sx={{ pb: 4, fontSize: 12 }}>
                  {date}
                  {journey?.description != null
                    ? ` - ${journey.description}`
                    : ''}
                </Typography>

                <Stack direction="row">
                  {admin === true && (
                    <>
                      <StatusChip status={journey.status} />
                      <Box sx={{ pr: 6 }} />
                    </>
                  )}

                  <Typography
                    variant="body2"
                    sx={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    noWrap
                  >
                    <TranslateRoundedIcon sx={{ fontSize: '14px', mr: 1 }} />
                    {displayLanguage}
                  </Typography>
                </Stack>
              </>
            ) : (
              <>
                <Skeleton variant="text" width={120} />
                <Skeleton
                  variant="text"
                  sx={{
                    display: 'flex',
                    justifySelf: 'flex-end',
                    mr: '20%',
                    mb: 4
                  }}
                />
                <Stack
                  direction="row"
                  spacing={4}
                  sx={{
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {admin === true && (
                    <>
                      <EditIcon sx={{ fontSize: '14px' }} />
                      <Skeleton variant="text" width={50} />
                    </>
                  )}
                  <TranslateRoundedIcon sx={{ fontSize: '14px' }} />
                  <Skeleton variant="text" width={50} />
                </Stack>
              </>
            )}
          </CardContent>
        </CardActionArea>
      </Link>

      {admin === true && (
        <CardActions sx={{ alignSelf: 'flex-end', width: '58px' }}>
          {journey != null ? (
            <JourneyCardMenu
              id={journey.id}
              status={journey.status}
              slug={journey.slug}
              published={journey.publishedAt != null}
              template
            />
          ) : (
            <>
              <IconButton disabled>
                <MoreVertIcon />
              </IconButton>
            </>
          )}
        </CardActions>
      )}
    </Card>
  )
}
