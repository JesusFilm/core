import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import { NextImage } from '@core/shared/ui/NextImage'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import type { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'
import { ContentOverlay } from './ContentOverlay'

import 'videojs-youtube'
import 'video.js/dist/video-js.css'

interface ContainedCoverProps {
  children: ReactNode
  backgroundColor: string
  videoBlock?: TreeBlock<VideoFields>
  imageBlock?: TreeBlock<ImageFields>
  backgroundBlur?: string
}

export function ContainedCover({
  children,
  backgroundColor,
  backgroundBlur,
  videoBlock,
  imageBlock
}: ContainedCoverProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const theme = useTheme()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (videoRef.current != null) {
      playerRef.current = videojs(videoRef.current, {
        autoplay: true,
        controls: false,
        preload: 'metadata',
        userActions: {
          hotkeys: false,
          doubleClick: false
        },
        muted: true,
        loop: true,
        poster: backgroundBlur
      })
      playerRef.current.on('ready', () => {
        playerRef.current?.currentTime(videoBlock?.startAt ?? 0)
        // plays youTube videos at the start time
        if (videoBlock?.source === 'youTube') playerRef.current?.play()
      })
      // Video jumps to new time and finishes loading
      playerRef.current.on('seeked', () => {
        setLoading(false)
      })
      playerRef.current.on('timeupdate', () => {
        if (
          videoBlock?.startAt != null &&
          videoBlock?.endAt != null &&
          videoBlock?.endAt > 0 &&
          playerRef.current != null
        ) {
          const currentTime = playerRef.current.currentTime()
          const { startAt, endAt } = videoBlock
          if (currentTime < (startAt ?? 0) || currentTime >= endAt) {
            playerRef.current.currentTime(startAt ?? 0)
          }
        }
      })
    }
  }, [imageBlock, theme, videoBlock, backgroundBlur])

  return (
    <>
      <Box
        data-testid="ContainedCover"
        sx={{
          position: 'relative',
          flexGrow: 1,
          width: { xs: '100%', sm: 'calc(50% + 6vh)', md: '100%' },
          height: { xs: 'auto', sm: '100%' },
          '> .video-js': {
            width: '100%',
            height: '100%',
            '> .vjs-tech': {
              objectFit: 'cover'
            },
            '> .vjs-loading-spinner': {
              zIndex: 1
            },
            '> .vjs-poster': {
              backgroundSize: 'cover'
            }
          }
        }}
      >
        {videoBlock?.videoId != null && (
          <video
            ref={videoRef}
            className="video-js"
            playsInline
            style={{ pointerEvents: 'none' }}
          >
            {videoBlock?.video?.variant?.hls != null && (
              <source
                src={videoBlock?.video.variant.hls}
                type="application/x-mpegURL"
              />
            )}
            {videoBlock?.source === 'youTube' && (
              <source
                src={`https://www.youtube.com/watch?v=${videoBlock?.videoId}`}
                type="video/youtube"
              />
            )}
          </video>
        )}
        {loading && imageBlock != null && backgroundBlur != null && (
          <NextImage
            data-testid={
              videoBlock != null
                ? 'VideoPosterCover'
                : 'ContainedCardImageCover'
            }
            src={imageBlock?.src ?? backgroundBlur}
            alt={imageBlock.alt}
            placeholder="blur"
            blurDataURL={backgroundBlur}
            layout="fill"
            objectFit="cover"
          />
        )}
      </Box>
      <ContentOverlay
        backgroundColor={backgroundColor}
        backgroundSrc={backgroundBlur}
      >
        {children}
      </ContentOverlay>
    </>
  )
}
