import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { abbreviateLanguageName } from '../../libs/abbreviateLanguageName'

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

interface TemplateGalleryCardProps {
  item?: Journey
  priority?: boolean
}

export function TemplateGalleryCard({
  item: journey,
  priority
}: TemplateGalleryCardProps): ReactElement {
  const localLanguage = journey?.language?.name.find(
    ({ primary }) => !primary
  )?.value
  const nativeLanguage =
    journey?.language?.name.find(({ primary }) => primary)?.value ?? ''

  const displayLanguage = abbreviateLanguageName(
    localLanguage ?? nativeLanguage
  )

  const theme = useTheme()
  const { t } = useTranslation('apps-journeys-admin')
  const date =
    journey != null
      ? intlFormat(parseISO(journey.createdAt), {
          month: 'short',
          year: isThisYear(parseISO(journey?.createdAt)) ? undefined : 'numeric'
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
        href={`/templates/${journey?.id ?? ''}`}
        passHref
        legacyBehavior
      >
        <Box
          component="a"
          tabIndex={-1}
          data-testid="templateGalleryCard"
          sx={{
            height: 'inherit',
            color: 'inherit',
            textDecoration: 'none'
          }}
        >
          {journey != null ? (
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
              {journey?.primaryImageBlock?.src != null ? (
                <>
                  <HoverLayer className="hoverImageEffects" />
                  <Image
                    rel={priority === true ? 'preload' : undefined}
                    priority={priority}
                    className="MuiImageBackground-root"
                    src={journey?.primaryImageBlock?.src}
                    alt={journey?.primaryImageBlock.alt}
                    fill
                    sizes={`(max-width: ${
                      theme.breakpoints.values.md - 0.5
                    }px) 130px, (max-width: ${
                      theme.breakpoints.values.xl - 0.5
                    }px) 180px, 280px`}
                    style={{
                      objectFit: 'cover'
                    }}
                  />
                </>
              ) : (
                <>
                  <HoverLayer className="hoverImageEffects" />
                  <InsertPhotoRoundedIcon className="MuiImageBackground-root" />
                </>
              )}
            </Stack>
          ) : (
            <Skeleton
              variant="rectangular"
              sx={{
                width: { xs: 130, md: 180, xl: 240 },
                height: { xs: 130, md: 180, xl: 240 },
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
                  {t('{{ date }} ● {{ displayLanguage }}', {
                    date,
                    displayLanguage
                  })}
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
