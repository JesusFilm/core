import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { abbreviateLanguageName } from '../../libs/abbreviateLanguageName'

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
      tabIndex={0}
      sx={{
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        width: { xs: 130, md: 180, xl: 240 },
        borderRadius: 2,
        boxShadow: 'none',
        p: 2,
        transition: (theme) => theme.transitions.create('background-color'),
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
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: (theme) => theme.palette.primary.main
        }
      }}
    >
      <NextLink
        href={journey != null ? `/templates/${journey.id}` : ''}
        passHref
        legacyBehavior
        prefetch={false}
      >
        <Box
          data-testid="templateGalleryCard"
          sx={{
            height: 'inherit'
          }}
        >
          <Stack
            justifyContent="center"
            alignItems="center"
            sx={{
              position: 'relative',
              aspectRatio: 1,
              overflow: 'hidden',
              borderRadius: 2,
              alignItems: 'center',
              backgroundColor: 'background.default'
            }}
          >
            <HoverLayer className="hoverImageEffects" />
            <Skeleton
              sx={{
                position: 'absolute',
                display: journey != null ? 'none' : 'block',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 3,
                backgroundColor: 'background.default',
                borderColor: 'divider',
                borderRadius: 2
              }}
            />
            <Image
              priority
              className="MuiImageBackground-root"
              src={
                journey?.primaryImageBlock?.src ??
                'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
              }
              alt={
                journey?.primaryImageBlock?.alt ??
                'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
              }
              fill
              sizes="(max-width: 900px) 240px, 480px"
              style={{
                objectFit: 'cover'
              }}
            />
            <Stack
              sx={{
                zIndex: journey?.primaryImageBlock?.src != null ? -1 : 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'background.default',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <InsertPhotoRoundedIcon className="MuiImageBackground-root" />
            </Stack>
          </Stack>
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
