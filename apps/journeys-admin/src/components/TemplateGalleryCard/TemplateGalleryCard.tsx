import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { GetAdminJourneys_journeys as AdminJourney } from '../../../__generated__/GetAdminJourneys'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'

export interface TemplateGalleryCardProps {
  journey?: AdminJourney | Journey
  isPublisher?: boolean
}

export function TemplateGalleryCard({
  journey,
  isPublisher
}: TemplateGalleryCardProps): ReactElement {
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
      aria-label="template-gallery-card"
      variant="outlined"
      sx={{
        width: 180,
        height: 306,
        border: 'none',
        borderRadius: 0,
        backgroundColor: 'background.default',
        cursor: 'pointer'
      }}
    >
      <NextLink
        href={
          journey != null
            ? `/${isPublisher === true ? 'publisher' : 'templates'}/${
                journey.id
              }`
            : ''
        }
        passHref
        legacyBehavior
      >
        <CardActionArea>
          {journey?.primaryImageBlock?.src != null ? (
            <CardMedia
              component="img"
              image={journey.primaryImageBlock.src}
              height="180px"
              alt={journey.title}
              sx={{
                maxWidth: 180,
                minWidth: 180,
                borderRadius: 2
              }}
            />
          ) : (
            <CardMedia
              component="div"
              sx={{
                height: 180,
                width: 180,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.default'
              }}
            >
              <InsertPhotoRoundedIcon />
            </CardMedia>
          )}
          <CardContent sx={{ px: 0 }}>
            {journey != null ? (
              <>
                <Typography variant="caption">
                  {date} ● {displayLanguage}
                </Typography>
                <Typography variant="subtitle2" sx={{ my: 1 }}>
                  {journey.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {journey?.description != null ? `${journey.description}` : ''}
                </Typography>
              </>
            ) : (
              <Box sx={{ height: '44px' }}>
                <Skeleton variant="text" width={120} />
                <Skeleton variant="text" width={120} />
                <Skeleton variant="text" width={150} />
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      </NextLink>
    </Card>
  )
}
