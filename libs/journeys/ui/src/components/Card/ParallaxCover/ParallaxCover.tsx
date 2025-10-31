import {
  ReactElement,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState
} from 'react'
import Box from '@mui/material/Box'

import { ImageFields } from '../../Image/__generated__/ImageFields'
import { TreeBlock } from '../../../libs/block'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { OverlayContent } from '../OverlayContent'
import { NextImage } from '@core/shared/ui/NextImage'
import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { getFooterMobileSpacing } from '../utils/getFooterElements'
import { useJourney } from '../../../libs/JourneyProvider'
import { addAlphaToHex, stripAlphaFromHex } from '../utils/colorOpacityUtils'

interface ParallaxCoverProps {
  children: ReactNode
  backgroundColor: string
  backgroundBlur?: string
  videoBlock?: TreeBlock<VideoFields>
  imageBlock?: TreeBlock<ImageFields>
  hasFullscreenVideo?: boolean
}

export function ParallaxCover({
  children,
  backgroundColor,
  backgroundBlur,
  videoBlock,
  imageBlock,
  hasFullscreenVideo = false
}: ParallaxCoverProps): ReactElement {
  return (
    <Box
      data-testid="parallax-cover"
      sx={{
        position: 'relative',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        perspective: '1px',
        perspectiveOrigin: 'top center'
      }}
    >
      {/* Background Layer - Static background, no parallax */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100%',
          width: '100%',
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
                WebkitBackdropFilter: 'blur(40px)',
                backdropFilter: 'blur(40px)'
              }}
            />
          </>
        )}
      </Box>

      <Box
        data-testid="parallax-cover-wrapper"
        sx={{
          position: 'relative',
          transformStyle: 'preserve-3d'
        }}
      >
        <Box
          data-testid="parallax-cover-image"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40vh',
            transform: 'translateZ(-1px) scale(2)',
            transformOrigin: 'center top',
            zIndex: -1
          }}
        >
          {imageBlock != null && backgroundBlur != null && (
            <NextImage
              data-testid="content-background-image"
              src={imageBlock.src ?? backgroundBlur}
              alt={imageBlock.alt}
              placeholder="blur"
              blurDataURL={backgroundBlur}
              layout="fill"
              objectFit="cover"
            />
          )}
        </Box>

        <Box
          data-testid="parallax-cover-content"
          sx={{
            position: 'relative',
            minHeight: '100vh',
            paddingTop: '30vh',
            transform: 'translateZ(0)',
            zIndex: 1
          }}
        >
          <OverlayContent hasFullscreenVideo={hasFullscreenVideo} sx={{}}>
            {children}
          </OverlayContent>
        </Box>
      </Box>
    </Box>
  )
}
