import Box from '@mui/material/Box'
import { ReactElement, ReactNode, useState } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { OverlayContent } from '../OverlayContent'
import { stripAlphaFromHex } from '../utils/colorOpacityUtils'
import { BackgroundVideo } from './BackgroundVideo'

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
  const [loading, setLoading] = useState(true)
  const baseBackgroundColor = stripAlphaFromHex(backgroundColor)

  const posterImage =
    videoBlock?.mediaVideo?.__typename === 'Video'
      ? // Use posterBlockId image or default poster image on video
        videoBlock?.posterBlockId != null
        ? (
            videoBlock.children.find(
              (block) =>
                block.id === videoBlock.posterBlockId &&
                block.__typename === 'ImageBlock'
            ) as TreeBlock<ImageFields>
          ).src
        : videoBlock?.mediaVideo?.images[0]?.mobileCinematicHigh
      : // Use Youtube or mux set poster image
        videoBlock?.image

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
      {videoBlock?.videoId != null && (
        <Box
          data-testid="simple-parallax-video"
          sx={{
            position: 'relative',
            width: '100%',
            height: IMAGE_HEIGHT,
            overflow: 'hidden'
          }}
        >
          <BackgroundVideo
            {...videoBlock}
            setLoading={setLoading}
            cardColor={backgroundColor}
          />
          {posterImage != null && loading && (
            <NextImage
              data-testid="video-poster-image"
              className="vjs-poster"
              src={posterImage}
              aria-details={posterImage}
              alt="card video image"
              layout="fill"
              objectFit="cover"
              sx={{
                transform:
                  videoBlock?.source === VideoBlockSource.youTube
                    ? 'scale(3)'
                    : 'unset'
              }}
            />
          )}
        </Box>
      )}
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
