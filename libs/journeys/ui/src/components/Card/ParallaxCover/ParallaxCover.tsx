import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { OverlayContent } from '../OverlayContent'
import { addAlphaToHex, stripAlphaFromHex } from '../utils/colorOpacityUtils'

interface ParallaxCoverProps {
  children: ReactNode
  backgroundColor: string
  backgroundBlur?: string
  videoBlock?: TreeBlock<VideoFields>
  imageBlock?: TreeBlock<ImageFields>
  hasFullscreenVideo?: boolean
}

// Layout constants
const VIEWPORT_HEIGHT = '100vh'
const PARALLAX_IMAGE_HEIGHT = '40vh'
const CONTENT_PADDING_TOP = '30vh'

// Parallax effect constants
const PARALLAX_PERSPECTIVE = '1px'
const PARALLAX_TRANSFORM_Z = '-0.5px'
const PARALLAX_SCALE = 1.5
const BACKGROUND_BLUR = '40px'

// Gradient mask constants - Parallax image bottom fade
const IMAGE_MASK_ALPHA_20 = 20
const IMAGE_MASK_ALPHA_40 = 40
const IMAGE_MASK_ALPHA_70 = 70
const IMAGE_MASK_STOP_1 = '5%'
const IMAGE_MASK_STOP_2 = '10%'
const IMAGE_MASK_STOP_3 = '18%'
const IMAGE_MASK_STOP_4 = '25%'

// Gradient mask constants - Content overlay top fade
const CONTENT_OVERLAY_OPACITY = 'dd'
const CONTENT_MASK_ALPHA_50 = 50
const CONTENT_MASK_STOP_1 = '5%'
const CONTENT_MASK_STOP_2 = '15%'

export function ParallaxCover({
  children,
  backgroundColor,
  backgroundBlur,
  videoBlock,
  imageBlock,
  hasFullscreenVideo = false
}: ParallaxCoverProps): ReactElement {
  const baseBackgroundColor = stripAlphaFromHex(backgroundColor)

  const BackgroundLayer = (
    <Box
      data-testid="parallax-background-layer"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0
      }}
    >
      {imageBlock != null && backgroundBlur != null && (
        <>
          <NextImage
            data-testid="background-image"
            src={imageBlock.src ?? backgroundBlur}
            alt={imageBlock.alt}
            placeholder="blur"
            blurDataURL={backgroundBlur}
            layout="fill"
            objectFit="cover"
            sx={{
              transform: 'scale(2) translate(0px, -25%)'
            }}
          />
          <Box
            sx={{
              height: '100%',
              width: '100%',
              WebkitBackdropFilter: `blur(${BACKGROUND_BLUR})`,
              backdropFilter: `blur(${BACKGROUND_BLUR})`
            }}
          />
        </>
      )}
    </Box>
  )

  const ParallaxImage = (
    <Box
      data-testid="parallax-cover-layer"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: PARALLAX_IMAGE_HEIGHT,
        transform: `translateZ(${PARALLAX_TRANSFORM_Z}) scale(${PARALLAX_SCALE})`,
        transformOrigin: 'center top',
        zIndex: 1,
        webkitMask: `linear-gradient(to top, transparent 0%, ${addAlphaToHex(baseBackgroundColor, IMAGE_MASK_ALPHA_20)} ${IMAGE_MASK_STOP_1}, ${addAlphaToHex(baseBackgroundColor, IMAGE_MASK_ALPHA_40)} ${IMAGE_MASK_STOP_2}, ${addAlphaToHex(baseBackgroundColor, IMAGE_MASK_ALPHA_70)} ${IMAGE_MASK_STOP_3}, ${baseBackgroundColor} ${IMAGE_MASK_STOP_4})`,
        mask: `linear-gradient(to top, transparent 0%, ${addAlphaToHex(baseBackgroundColor, IMAGE_MASK_ALPHA_20)} ${IMAGE_MASK_STOP_1}, ${addAlphaToHex(baseBackgroundColor, IMAGE_MASK_ALPHA_40)} ${IMAGE_MASK_STOP_2}, ${addAlphaToHex(baseBackgroundColor, IMAGE_MASK_ALPHA_70)} ${IMAGE_MASK_STOP_3}, ${baseBackgroundColor} ${IMAGE_MASK_STOP_4})`
      }}
    >
      {imageBlock != null && backgroundBlur != null && (
        <NextImage
          data-testid="parallax-cover-image"
          src={imageBlock.src ?? backgroundBlur}
          alt={imageBlock.alt}
          placeholder="blur"
          blurDataURL={backgroundBlur}
          layout="fill"
          objectFit="cover"
        />
      )}
    </Box>
  )

  const ParallaxContent = (
    <Box
      data-testid="parallax-cover-content"
      sx={{
        position: 'relative',
        minHeight: VIEWPORT_HEIGHT,
        paddingTop: CONTENT_PADDING_TOP,
        transform: 'translateZ(0)',
        zIndex: 2
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: CONTENT_PADDING_TOP,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          pointerEvents: 'none',
          backgroundColor: `${baseBackgroundColor}${CONTENT_OVERLAY_OPACITY}`,
          WebkitMask: `linear-gradient(to bottom, transparent 0%, ${addAlphaToHex(baseBackgroundColor, CONTENT_MASK_ALPHA_50)} ${CONTENT_MASK_STOP_1}, ${baseBackgroundColor} ${CONTENT_MASK_STOP_2})`,
          mask: `linear-gradient(to bottom, transparent 0%, ${addAlphaToHex(baseBackgroundColor, CONTENT_MASK_ALPHA_50)} ${CONTENT_MASK_STOP_1}, ${baseBackgroundColor} ${CONTENT_MASK_STOP_2})`
        }}
      />
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
  )

  return (
    <Box
      data-testid="parallax-cover"
      sx={{
        position: 'relative',
        height: VIEWPORT_HEIGHT,
        overflow: 'hidden'
      }}
    >
      {BackgroundLayer}
      <Box
        data-testid="parallax-cover-wrapper"
        sx={{
          position: 'relative',
          height: VIEWPORT_HEIGHT,
          overflowY: 'auto',
          overflowX: 'hidden',
          perspective: PARALLAX_PERSPECTIVE,
          perspectiveOrigin: 'top center',
          transformStyle: 'preserve-3d',
          zIndex: 1
        }}
      >
        {ParallaxImage}
        {ParallaxContent}
      </Box>
    </Box>
  )
}
