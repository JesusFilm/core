import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'

export interface TemplateGalleryCardProps {
  journey?: Journey
}

export function TemplateGalleryCard({
  journey
}: TemplateGalleryCardProps): ReactElement {
  const localLanguage = journey?.language?.name.find(
    ({ primary }) => !primary
  )?.value
  const nativeLanguage =
    journey?.language?.name.find(({ primary }) => primary)?.value ?? ''
  const displayLanguage =
    nativeLanguage === localLanguage || localLanguage == null
      ? nativeLanguage
      : `${nativeLanguage} (${localLanguage})`

  console.log(parseISO(journey?.createdAt))
  console.log(intlFormat(parseISO(journey?.createdAt)))
  console.log(isThisYear(parseISO(journey?.createdAt)))

  const date =
    journey != null
      ? intlFormat(parseISO(journey.createdAt), {
          month: 'long',
          year: isThisYear(parseISO(journey?.createdAt)) ? undefined : 'numeric'
        }).replace(' ', ', ')
      : ''

  return (
    <Card
      aria-label="template-gallery-card"
      variant="outlined"
      sx={{
        width: { xs: 124, lg: 180 },
        height: { xs: 223, lg: 266 },
        border: 'none',
        borderRadius: 0,
        backgroundColor: 'transparent',
        cursor: 'pointer'
      }}
    >
      <NextLink
        href={journey != null ? `/templates/${journey.id}` : ''}
        passHref
        legacyBehavior
      >
        <CardActionArea sx={{ height: 'inherit' }}>
          {journey?.primaryImageBlock?.src != null ? (
            <Box
              sx={{
                position: 'relative',
                width: { xs: 124, lg: 180 },
                height: { xs: 130, lg: 180 }
              }}
            >
              <Image
                src={journey?.primaryImageBlock?.src}
                alt={journey?.primaryImageBlock.alt}
                fill
                style={{ borderRadius: 8, objectFit: 'cover' }}
              />
            </Box>
          ) : (
            <CardMedia
              component="div"
              sx={{
                height: { xs: 124, lg: 180 },
                width: { xs: 130, lg: 180 },
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
          <CardContent sx={{ display: 'flex', flexDirection: 'column', px: 0 }}>
            {journey != null ? (
              <>
                <Typography variant="caption">
                  {date} ● {displayLanguage}
                </Typography>
                <Typography variant="subtitle2" sx={{ my: 1 }}>
                  {journey.title}
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
