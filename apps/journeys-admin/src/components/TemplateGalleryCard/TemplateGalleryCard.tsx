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
import { abbreviateLanguageName } from '../../libs/abbreviateLanguageName'

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

  const displayLanguage = abbreviateLanguageName(
    localLanguage ?? nativeLanguage
  )

  const date =
    journey != null
      ? intlFormat(parseISO(journey.createdAt), {
          month: 'short',
          year: isThisYear(parseISO(journey?.createdAt)) ? 'numeric' : undefined
        }).replace(' ', ', ')
      : ''

  return (
    <Card
      aria-label="template-gallery-card"
      variant="outlined"
      sx={{
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer'
      }}
    >
      <NextLink
        href={journey != null ? `/templates/${journey.id}` : ''}
        passHref
        legacyBehavior
      >
        <CardActionArea
          sx={{
            height: 'inherit',
            '&>.MuiCardActionArea-focusHighlight': {
              backgroundColor: 'transparent'
            }
          }}
        >
          {journey != null ? (
            journey?.primaryImageBlock?.src != null ? (
              <Box
                sx={{
                  position: 'relative',
                  aspectRatio: 1
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
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderColor: 'divider',
                  aspectRatio: 1,
                  borderRadius: 2,
                  backgroundColor: 'background.default'
                }}
              >
                <InsertPhotoRoundedIcon />
              </CardMedia>
            )
          ) : (
            <Skeleton
              variant="rectangular"
              sx={{
                height: { xs: 130, lg: 180 },
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.default'
              }}
            />
          )}
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              px: 0,
              py: 3
            }}
          >
            {journey != null ? (
              <>
                <Typography
                  variant="overline2"
                  sx={{
                    whiteSpace: 'noWrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: (theme) => theme.palette.grey[700]
                  }}
                >
                  {date} ● {displayLanguage}
                </Typography>
                <Box
                  sx={{
                    display: { xs: 'none', lg: '-webkit-box' },
                    height: '66px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      my: 1,
                      display: { xs: 'none', lg: 'block' }
                    }}
                  >
                    {journey.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: { xs: '-webkit-box', lg: 'none' },
                    height: '63px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 3
                  }}
                >
                  <Typography
                    variant="subtitle3"
                    sx={{
                      my: 1,
                      display: { xs: 'block', lg: 'none' }
                    }}
                  >
                    {journey.title}
                  </Typography>
                </Box>
              </>
            ) : (
              <Box>
                <Skeleton variant="text" sx={{ width: '100%' }} />
                <Skeleton variant="text" sx={{ width: '100%' }} />
                <Skeleton variant="text" sx={{ width: '60%' }} />
              </Box>
            )}
          </CardContent>
        </CardActionArea>
      </NextLink>
    </Card>
  )
}
