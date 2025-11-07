import Box from '@mui/material/Box'
import { ReactElement, ReactNode, useState } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { OverlayContent } from '../OverlayContent'
import { stripAlphaFromHex } from '../utils/colorOpacityUtils'

import { BackgroundVideo } from '../ContainedCover/BackgroundVideo'

interface WebsiteCoverProps {
  children: ReactNode[]
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
            ) as TreeBlock<ImageFields> | undefined
          )?.src
        : videoBlock?.mediaVideo?.images[0]?.mobileCinematicHigh
      : // Use Youtube or mux set poster image
        videoBlock?.image

  const VideoSection =
    videoBlock != null ? (
      <Box
        data-testid="website-cover-video"
        sx={{
          position: 'relative',
          width: '100%',
          flex: 1,
          minHeight: MEDIA_HEIGHT,
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
                videoBlock.source === VideoBlockSource.youTube
                  ? 'scale(2)'
                  : 'unset'
            }}
          />
        )}
      </Box>
    ) : null

  const ImageSection =
    imageBlock != null && backgroundBlur != null ? (
      <Box
        data-testid="website-cover-image"
        sx={{
          position: 'relative',
          width: '100%',
          flex: 1,
          minHeight: MEDIA_HEIGHT
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
    ) : null

  return (
    <Box
      data-testid="website-cover"
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: baseBackgroundColor
      }}
    >
      {VideoSection}
      {ImageSection}

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
