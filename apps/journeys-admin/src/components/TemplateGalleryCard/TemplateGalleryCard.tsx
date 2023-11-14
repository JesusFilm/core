import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { abbreviateLanguageName } from '../../libs/abbreviateLanguageName'
// import { HoverLayer } from '../TemplateGallery/HoverLayer'

export interface TemplateGalleryCardProps {
  item?: Journey
}

interface HoverLayerProps {
  className?: string
}

export function HoverLayer({ className }: HoverLayerProps): ReactElement {
  return (
    <Box
      data-testid="hoverLayer"
      className={className}
      sx={{
        transition: (theme) => theme.transitions.create('opacity'),
        content: '""',
        opacity: 0,
        backgroundColor: 'secondary.dark',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 2
      }}
    />
  )
}

export function TemplateGalleryCard({
  item: journey
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
      aria-label="templateGalleryCard"
      variant="outlined"
      sx={{
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        width: { xs: 130, md: 180 },
        borderRadius: 2
      }}
    >
      <NextLink
        href={journey != null ? `/templates/${journey.id}` : ''}
        passHref
        legacyBehavior
      >
        <Box
          data-testid="templateGalleryCard"
          sx={{
            height: 'inherit',
            transition: (theme) => theme.transitions.create('all'),
            '& .MuiImageBackground-root': {
              transition: (theme) => theme.transitions.create('transform')
            },
            '&:hover': {
              backgroundColor: (theme) => theme.palette.grey[200],
              '& .MuiImageBackground-root': {
                transform: 'scale(1.05)'
              },
              '& .hoverImageEffects': {
                opacity: 0.3
              }
            }
          }}
        >
          {journey != null ? (
            journey?.primaryImageBlock?.src != null ? (
              <Box
                sx={{
                  position: 'relative',
                  aspectRatio: 1,
                  overflow: 'hidden',
                  borderRadius: 2
                }}
              >
                <HoverLayer className="hoverImageEffects" />
                <Image
                  className="MuiImageBackground-root"
                  src={journey?.primaryImageBlock?.src}
                  alt={journey?.primaryImageBlock.alt}
                  fill
                  style={{
                    objectFit: 'cover'
                  }}
                />
              </Box>
            ) : (
              <CardMedia
                component="div"
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderColor: 'divider',
                  aspectRatio: 1,
                  borderRadius: 2,
                  backgroundColor: 'background.default',
                  overflow: 'hidden'
                }}
              >
                <HoverLayer className="hoverImageEffects" />
                <InsertPhotoRoundedIcon className="MuiImageBackground-root" />
              </CardMedia>
            )
          ) : (
            <Skeleton
              variant="rectangular"
              sx={{
                width: { xs: 130, md: 180 },
                height: { xs: 130, md: 180 },
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'background.default'
              }}
            />
          )}
          <Stack
            sx={{
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
                    display: { xs: 'none', md: '-webkit-box' },
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
                      my: 1
                    }}
                  >
                    {journey.title}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: { xs: '-webkit-box', md: 'none' },
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
                      my: 1
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
          </Stack>
        </Box>
      </NextLink>
    </Card>
  )
}
