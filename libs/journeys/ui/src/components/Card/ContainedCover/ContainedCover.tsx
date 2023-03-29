import {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
  CSSProperties
} from 'react'
import videojs from 'video.js'
import { NextImage } from '@core/shared/ui/NextImage'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import type { TreeBlock } from '../../../libs/block'
import {
  VideoBlockObjectFit,
  VideoBlockSource
} from '../../../../__generated__/globalTypes'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { VideoFields } from '../../Video/__generated__/VideoFields'

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

  const isYouTube = videoBlock?.source === VideoBlockSource.youTube

  useEffect(() => {
    if (videoRef.current != null) {
      // autoplay when video is YouTube on iOS does not work. We should disable autoplay in that case.
      const isYouTubeAndiOS =
        isYouTube && /iPhone|iPad|iPod/i.test(navigator?.userAgent)
      playerRef.current = videojs(videoRef.current, {
        autoplay: !isYouTubeAndiOS,
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
        if (videoBlock?.source === VideoBlockSource.youTube)
          void playerRef.current?.play()
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
  }, [imageBlock, theme, videoBlock, backgroundBlur, isYouTube])

  const videoImage =
    videoBlock?.source === VideoBlockSource.internal
      ? videoBlock?.video?.image
      : videoBlock?.image

  let videoFit: CSSProperties['objectFit']
  if (videoBlock?.source === VideoBlockSource.youTube) {
    videoFit = 'contain'
  } else {
    switch (videoBlock?.objectFit) {
      case VideoBlockObjectFit.fill:
        videoFit = 'cover'
        break
      case VideoBlockObjectFit.fit:
        videoFit = 'contain'
        break
      case VideoBlockObjectFit.zoomed:
        videoFit = 'contain'
        break
      default:
        videoFit = 'cover'
        break
    }
  }
  return (
    <>
      <Box
        data-testid="ContainedCover"
        sx={{
          position: 'relative',
          flexGrow: 1,
          width: '100%',
          height: 'auto',
          '> .video-js': {
            width: '100%',
            height: '100%',
            '> .vjs-tech': {
              objectFit: videoFit,
              transform:
                videoBlock?.objectFit === VideoBlockObjectFit.zoomed
                  ? 'scale(1.33)'
                  : undefined
            },
            '> .vjs-loading-spinner': {
              zIndex: 1,
              display: isYouTube ? 'none' : 'block'
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
            {videoBlock?.source === VideoBlockSource.internal &&
              videoBlock?.video?.variant?.hls != null && (
                <source
                  src={videoBlock?.video.variant.hls}
                  type="application/x-mpegURL"
                />
              )}
            {videoBlock?.source === VideoBlockSource.youTube && (
              <source
                src={`https://www.youtube.com/watch?v=${videoBlock?.videoId}`}
                type="video/youtube"
              />
            )}
          </video>
        )}
        {/* video image */}
        {videoImage != null && loading && (
          <NextImage
            src={videoImage}
            alt="card video image"
            layout="fill"
            objectFit="cover"
          />
        )}

        {/* background image */}
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
      <Box
        sx={{
          width: '100%',
          height: '100%',
          zIndex: 1,
          bottom: 0,
          overflow: 'hidden',
          position: 'absolute',
          // Set to maintain RTL
          marginRight: 0,
          paddingRight: 0,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          background:
            // Ease out gradient
            `linear-gradient(to bottom,
              hsla(0, 0%, 0%, 0) 0%,
              hsla(0, 0%, 0%, 0.013) 10.6%,
              hsla(0, 0%, 0%, 0.049) 19.6%,
              hsla(0, 0%, 0%, 0.104) 27.3%,
              hsla(0, 0%, 0%, 0.175) 33.9%,
              hsla(0, 0%, 0%, 0.352) 44.8%,
              hsla(0, 0%, 0%, 0.45) 49.6%,
              hsla(0, 0%, 0%, 0.55) 54.1%,
              hsla(0, 0%, 0%, 0.648) 58.8%,
              hsla(0, 0%, 0%, 0.741) 63.6%,
              hsla(0, 0%, 0%, 0.825) 69%,
              hsla(0, 0%, 0%, 0.896) 75.1%,
              hsla(0, 0%, 0%, 0.951) 82.2%,
              hsla(0, 0%, 0%, 0.987) 90.4%,
              hsl(0, 0%, 0%) 100%)`
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            height: { xs: 'calc(100% - 110px)', md: 'calc(100% - 110px)' },
            p: {
              xs: `${theme.spacing(0)} 32px 110px 32px`,
              md: `${theme.spacing(0)} 32px 110px 32px`
            },
            '& > *': {
              '&:first-child': { mt: 0 },
              '&:last-child': { mb: 0 }
            }
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  )
}
