import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import { lighten, styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { ReactElement, useState } from 'react'

import { VideoChildFields } from '../../../../../__generated__/VideoChildFields'
import { getLabelDetails } from '../../../../libs/utils/getLabelDetails/getLabelDetails'
import { getWatchUrl } from '../../../../libs/utils/getWatchUrl'
import Play3 from '@core/shared/ui/icons/Play3'

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
  overflow: 'hidden',
  boxSizing: 'border-box'
})

interface VideoCardProps {
  video: VideoChildFields
  containerSlug?: string
  active: boolean
}

export function VideoCard({
  video,
  containerSlug,
  active
}: VideoCardProps): ReactElement {
  const { label } = getLabelDetails(video.label)
  const href = getWatchUrl(containerSlug, video.label, video.variant?.slug)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <NextLink href={href} passHref legacyBehavior scroll={false}>
      <Link
        display="block"
        underline="none"
        color="inherit"
        sx={{ pointerEvents: video != null ? 'auto' : 'none' }}
        aria-label="VideoCard"
        data-testid={video != null ? `VideoCard-${video.id}` : 'VideoCard'}
      >
        <Stack spacing={3}>
          <ImageButton disabled={video == null} sx={{ textAlign: 'left' }}>
            <Box
              sx={{
                position: 'relative',
                maxWidth: 200,
                height: 240,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                width: '100%',
                borderRadius: 3,
                cursor: 'pointer',
                bgcolor: 'common.black'
              }}
              tabIndex={0}
              role="button"
              data-testid={`CarouselItem-${video.slug}`}
              aria-label={`Navigate to ${video.slug}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Layer>
                <Image
                  fill
                  src={video.images[0].mobileCinematicHigh ?? ''}
                  alt={video.imageAlt[0].value}
                  style={{
                    width: '100%',
                    objectFit: 'cover',
                    maskImage:
                      'linear-gradient(to bottom, rgba(0,0,0,1) 50%, transparent 100%)',
                    maskSize: 'cover'
                  }}
                />
              </Layer>
              <Layer
                sx={{
                  overflow: 'visible',
                  boxShadow:
                    active || isHovered ? 'inset 0 0 0 4px #fff' : undefined,
                  transition: 'box-shadow 100ms ease-in-out',
                  pointerEvents: 'none'
                }}
                data-testid="ActiveLayer"
              />
              <Fade in={!active && isHovered}>
                <IconButton
                  sx={{
                    padding: 5,
                    position: 'absolute',
                    top: '50%',
                    right: '50%',
                    transform: 'translate(50%, -50%)',
                    color: 'common.white',
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    '&:hover': {
                      bgcolor: 'primary.main'
                    }
                  }}
                >
                  <Play3 sx={{ fontSize: 48 }} />
                </IconButton>
              </Fade>
              <Box sx={{ p: 4, fontFamily: 'Inter' }}>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-apercu-pro)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: ({ palette }) => lighten(palette.text.secondary, 1)
                  }}
                  data-testid="CarouselItemCategory"
                >
                  {label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-apercu-pro)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'common.white',
                    lineHeight: 'tight',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}
                  data-testid={`CarouselItemTitle-${video.slug}`}
                >
                  {video.title[0].value}
                </Typography>
              </Box>
            </Box>
          </ImageButton>
        </Stack>
      </Link>
    </NextLink>
  )
}
