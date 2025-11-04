import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { OverlayContent } from '../OverlayContent'
import { stripAlphaFromHex } from '../utils/colorOpacityUtils'

interface SimpleParallaxProps {
  children: ReactNode
  backgroundColor: string
  backgroundBlur?: string
  videoBlock?: TreeBlock<VideoFields>
  imageBlock?: TreeBlock<ImageFields>
  hasFullscreenVideo?: boolean
}

// Layout constants
const IMAGE_HEIGHT = '30vh'

export function SimpleParallax({
  children,
  backgroundColor,
  backgroundBlur,
  videoBlock,
  imageBlock,
  hasFullscreenVideo = false
}: SimpleParallaxProps): ReactElement {
  const baseBackgroundColor = stripAlphaFromHex(backgroundColor)

  return (
    <Box
      data-testid="simple-parallax"
      sx={{
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: baseBackgroundColor
      }}
    >
      {imageBlock != null && backgroundBlur != null && (
        <Box
          data-testid="simple-parallax-image"
          sx={{
            position: 'relative',
            width: '100%',
            height: IMAGE_HEIGHT
          }}
        >
          <NextImage
            src={imageBlock.src ?? backgroundBlur}
            alt={imageBlock.alt}
            placeholder="blur"
            blurDataURL={backgroundBlur}
            layout="fill"
            objectFit="cover"
          />
        </Box>
      )}

      <Box data-testid="simple-parallax-content">
        <OverlayContent
          hasFullscreenVideo={hasFullscreenVideo}
          sx={{
            mx: 'auto',
            width: {
              xs: 'calc(100% - 32px - env(safe-area-inset-left) - env(safe-area-inset-right))',
              sm: 360,
              md: 500
            }
          }}
        >
          {children}
        </OverlayContent>
      </Box>
    </Box>
  )
}
