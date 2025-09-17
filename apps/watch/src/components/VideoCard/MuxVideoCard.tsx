import PlayArrow from '@mui/icons-material/PlayArrowRounded'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { type SxProps, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import type { MouseEvent, ReactElement } from 'react'

import type { CarouselMuxSlide } from '../../types/inserts'

interface MuxVideoCardProps {
  insert: CarouselMuxSlide
  variant?: 'contained' | 'expanded'
  active?: boolean
  imageSx?: SxProps
  onClick?: (videoId?: string) => (event: MouseEvent) => void
}

const ImageButton = styled(ButtonBase)(() => ({
  borderRadius: 8,
  width: '100%',
  position: 'relative'
}))

const Layer = styled(Box)({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  borderRadius: 8,
  overflow: 'hidden'
})

const PosterLayer = styled('div')(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  backgroundColor: theme.palette.common.black,
  transition: theme.transitions.create('opacity', { duration: 600 }),
  backgroundSize: 'cover',
  backgroundPosition: 'center center'
}))

export function MuxVideoCard({
  insert,
  variant = 'expanded',
  active,
  imageSx,
  onClick: handleClick
}: MuxVideoCardProps): ReactElement {
  const poster = insert.posterOverride ?? insert.urls.poster
  // For mux inserts, we'll use a placeholder href since they don't navigate to specific videos
  const href = '#'

  return (
    <Link
      component={NextLink}
      href={href}
      display="block"
      underline="none"
      color="inherit"
      aria-label="VideoCard"
      data-testid={`VideoCard-${insert.id}`}
      onClick={handleClick?.(insert.id)}
      locale={false}
    >
      <Stack spacing={3}>
        <ImageButton
          sx={{
            overflow: 'hidden',
            aspectRatio: '16 / 9',
            // White border when active (currently playing)
            border: active ? '3px solid white' : 'none',
            '&:hover, &.Mui-focusVisible': {
              '& .MuiImageBackground-root': {
                transform: 'scale(1.02)'
              },
              '& .MuiImageBackdrop-contained-root': {
                opacity: 0.15
              },
              '& .MuiImageBackdrop-expanded-root': {
                opacity: 0.5
              }
            },
            ...imageSx
          }}
        >
          <Layer
            className="MuiImageBackground-root"
            sx={{
              background: 'rgba(0,0,0,0.5)',
              transition: (theme) => theme.transitions.create('transform')
            }}
          >
            {/* Static poster image - no video element */}
            <PosterLayer
              sx={{
                opacity: 1,
                backgroundImage: `url(${poster})`
              }}
            />
          </Layer>
          {variant === 'contained' && (
            <Layer
              sx={{
                background:
                  'linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.8) 100%)',
                transition: (theme) => theme.transitions.create('opacity'),
                boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.12)'
              }}
              className="MuiImageBackdrop-contained-root"
            />
          )}
          {variant === 'expanded' && (
            <Layer
              sx={{
                background:
                  'linear-gradient(180deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.6) 100%)',
                transition: (theme) => theme.transitions.create('opacity'),
                opacity: 0.15
              }}
              className="MuiImageBackdrop-expanded-root"
            />
          )}
          <Layer
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              p: variant === 'contained' ? 4 : 1
            }}
          >
            {variant === 'contained' && (
              <Typography
                variant="h6"
                component="h3"
                color="primary.contrastText"
                fontWeight="bold"
                fontSize={21}
                lineHeight={27 / 21}
                sx={{
                  textAlign: 'left',
                  textShadow:
                    '0px 4px 4px rgba(0, 0, 0, 0.25), 0px 2px 3px rgba(0, 0, 0, 0.45)'
                }}
              >
                {insert.overlay.title}
              </Typography>
            )}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
              sx={{ minWidth: 0 }}
              spacing={2}
            >
              <Typography
                variant="overline2"
                color="primary.main"
                sx={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  lineHeight: '29px'
                }}
              >
                {variant === 'contained' && insert.overlay.label}
              </Typography>

              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 29,
                  color: 'primary.contrastText',
                  backgroundColor:
                    active === true ? 'primary.main' : 'rgba(0, 0, 0, 0.5)',
                  flexShrink: 0
                }}
              >
                {active === true ? (
                  <>
                    <PlayArrow sx={{ fontSize: '1rem' }} />
                    <Typography variant="h6">Playing now</Typography>
                  </>
                ) : (
                  <>
                    <PlayArrow sx={{ fontSize: '1rem' }} />
                    <Typography variant="h6">
                      {insert.overlay.collection}
                    </Typography>
                  </>
                )}
              </Stack>
            </Stack>
          </Layer>
        </ImageButton>
        {variant === 'expanded' && (
          <>
            <Typography variant="overline2" sx={{ opacity: 0.5 }}>
              {insert.overlay.label}
            </Typography>
            <Typography
              color="textPrimary"
              variant="h6"
              component="h3"
              fontWeight="bold"
              fontSize={21}
              lineHeight={27 / 21}
            >
              {insert.overlay.title}
            </Typography>
          </>
        )}
      </Stack>
    </Link>
  )
}
