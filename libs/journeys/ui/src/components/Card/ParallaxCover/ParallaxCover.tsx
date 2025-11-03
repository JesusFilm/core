import Box from '@mui/material/Box'
import {
  ReactElement,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState
} from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { OverlayContent } from '../OverlayContent'
import { addAlphaToHex, stripAlphaFromHex } from '../utils/colorOpacityUtils'
import { getFooterMobileSpacing } from '../utils/getFooterElements'

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
  const baseBackgroundColor = stripAlphaFromHex(backgroundColor)

  return (
    <Box
      data-testid="parallax-cover"
      sx={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Fixed background - stays in place while content scrolls */}
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
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          perspective: '1px',
          perspectiveOrigin: 'top center',
          transformStyle: 'preserve-3d',
          zIndex: 1
        }}
      >
        {/* Parallax cover image - appears above background, below content */}
        <Box
          data-testid="parallax-cover-layer"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40vh',
            transform: 'translateZ(-0.5px) scale(1.5)',
            transformOrigin: 'center top',
            zIndex: 1,
            webkitMask:
              'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 3%, rgba(0,0,0,0.6) 6%, black 12%)',
            mask: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 3%, rgba(0,0,0,0.6) 6%, black 12%)'
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

        <Box
          data-testid="parallax-cover-content"
          sx={{
            position: 'relative',
            minHeight: '100vh',
            paddingTop: '30vh',
            transform: 'translateZ(0)',
            zIndex: 2
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '30vh',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
              pointerEvents: 'none',
              backgroundColor: `${baseBackgroundColor}CC`,
              WebkitMask:
                'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 5%, black 15%)',
              mask: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 5%, black 15%)'
            }}
          />
          <OverlayContent hasFullscreenVideo={hasFullscreenVideo} sx={{}}>
            {children}
          </OverlayContent>
        </Box>
      </Box>
    </Box>
  )
}
