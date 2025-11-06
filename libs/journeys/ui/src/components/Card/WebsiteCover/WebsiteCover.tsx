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

interface WebsiteCoverProps {
  children: ReactNode
  backgroundColor: string
  backgroundBlur?: string
  videoBlock?: TreeBlock<VideoFields>
  imageBlock?: TreeBlock<ImageFields>
  hasFullscreenVideo?: boolean
}

// Layout constants
const MEDIA_HEIGHT = { xs: '320px', md: '480px' }

export function WebsiteCover({
  children,
  backgroundColor,
  backgroundBlur,
  videoBlock,
  imageBlock,
  hasFullscreenVideo = false
}: WebsiteCoverProps): ReactElement {
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
      data-testid="website-cover"
      sx={{
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: baseBackgroundColor
      }}
    >
      {videoBlock != null && (
        <Box
          data-testid="website-cover-video"
          sx={{
            position: 'relative',
            width: '100%',
            height: MEDIA_HEIGHT,
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
          data-testid="website-cover-image"
          sx={{
            position: 'relative',
            width: '100%',
            height: MEDIA_HEIGHT
          }}
        >
          <NextImage
            src={imageBlock.src ?? backgroundBlur}
            alt={imageBlock.alt}
            placeholder="blur"
            blurDataURL={backgroundBlur}
            layout="fill"
            objectFit="cover"
            objectPosition={`${imageBlock.focalLeft}% ${imageBlock.focalTop}%`}
            sx={{
              transform: `scale(${(imageBlock.scale ?? 100) / 100})`,
              transformOrigin: `${imageBlock.focalLeft}% ${imageBlock.focalTop}%`
            }}
          />
        </Box>
      )}

      <Box data-testid="website-cover-content">
        <OverlayContent
          hasFullscreenVideo={hasFullscreenVideo}
          sx={{
            mx: 'auto',
            width: {
              xs: 'calc(100% - 32px - env(safe-area-inset-left) - env(safe-area-inset-right))',
              sm: 360,
              md: 500,
              lg: 767
            }
          }}
        >
          {children}
        </OverlayContent>
      </Box>
    </Box>
  )
}
