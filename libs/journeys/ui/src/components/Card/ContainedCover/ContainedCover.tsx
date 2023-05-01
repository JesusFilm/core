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
import { useTheme, styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
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
  videoBlock?: TreeBlock<VideoFields>
  imageBlock?: TreeBlock<ImageFields>
  backgroundBlur?: string
}

const StyledVideo = styled('video')(() => ({}))

export function ContainedCover({
  children,
  backgroundBlur,
  videoBlock,
  imageBlock
}: ContainedCoverProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<videojs.Player>()
  const theme = useTheme()
  const [loading, setLoading] = useState(true)

  const isYouTube = videoBlock?.source === VideoBlockSource.youTube

  const posterImage =
    videoBlock?.source === VideoBlockSource.internal
      ? // Use posterBlockId image or default poster image on video
        videoBlock?.posterBlockId != null
        ? (
            videoBlock.children.find(
              (block) =>
                block.id === videoBlock.posterBlockId &&
                block.__typename === 'ImageBlock'
            ) as TreeBlock<ImageFields>
          ).src
        : videoBlock?.video?.image
      : // Use Youtube set poster image
        videoBlock?.image

  console.log(posterImage != null, videoBlock, imageBlock != null)

  useEffect(() => {
    if (videoRef.current != null) {
      // autoplay when video is YouTube on iOS does not work. We should disable autoplay in that case.
      const isYouTubeAndiOS =
        isYouTube && /iPhone|iPad|iPod/i.test(navigator?.userAgent)
      playerRef.current = videojs(videoRef.current, {
        autoplay: !isYouTubeAndiOS,
        controls: false,
        preload: 'metadata',
        // Make video fill container instead of set aspect ratio
        fill: true,
        userActions: {
          hotkeys: false,
          doubleClick: false
        },
        muted: true,
        loop: true
        // poster: posterImage ?? undefined
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
  }, [imageBlock, theme, videoBlock, posterImage, isYouTube])

  let videoFit: CSSProperties['objectFit']
  if (videoBlock?.source === VideoBlockSource.youTube) {
    videoFit = 'contain'
  } else {
    switch (videoBlock?.objectFit) {
      case VideoBlockObjectFit.fit:
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
      <Box data-testid="ContainedCover" sx={{ width: '100%', height: '100%' }}>
        {/* Background Video */}
        {videoBlock?.videoId != null && (
          <StyledVideo
            ref={videoRef}
            className="video-js"
            playsInline
            preload="auto"
            sx={{
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
              pointerEvents: 'none'
            }}
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
          </StyledVideo>
        )}
        {/* Video Poster Image - not linked to video as poster so causes longer LCP loading times, but still faster since using optimized image */}
        {posterImage != null &&
          videoBlock != null &&
          imageBlock == null &&
          loading && (
            <NextImage
              className="vjs-poster"
              src={posterImage}
              alt="card video image"
              layout="fill"
              objectFit="cover"
              priority
            />
          )}

        {/* Background Image */}
        {backgroundBlur != null &&
          videoBlock == null &&
          imageBlock != null &&
          loading && (
            <NextImage
              data-testid="ContainedCardImageCover"
              src={imageBlock?.src ?? backgroundBlur}
              alt={imageBlock.alt}
              placeholder="blur"
              blurDataURL={backgroundBlur}
              layout="fill"
              objectFit="cover"
              priority
            />
          )}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          zIndex: 1,
          width: 'inherit',
          height: '100%',
          filter: 'blur(10%)',
          background:
            // Ease out gradient
            'linear-gradient(to bottom,hsla(0, 0%, 0%, 0) 0%,hsla(0, 0%, 0%, 0.013) 10.6%,hsla(0, 0%, 0%, 0.049) 19.6%,hsla(0, 0%, 0%, 0.104) 27.3%,hsla(0, 0%, 0%, 0.175) 33.9%,hsla(0, 0%, 0%, 0.352) 44.8%,hsla(0, 0%, 0%, 0.45) 49.6%,hsla(0, 0%, 0%, 0.55) 54.1%,hsla(0, 0%, 0%, 0.648) 58.8%,hsla(0, 0%, 0%, 0.741) 63.6%,hsla(0, 0%, 0%, 0.825) 69%,hsla(0, 0%, 0%, 0.896) 75.1%,hsla(0, 0%, 0%, 0.951) 82.2%,hsla(0, 0%, 0%, 0.987) 90.4%,hsl(0, 0%, 0%) 100%)'
        }}
      >
        <Box
          sx={{
            filter: 'blur(10px)',
            background: 'linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0))'
          }}
        />
        <Stack
          sx={{
            justifyContent: 'flex-end',
            bottom: 0,
            position: 'absolute',
            width: 'calc(100% - 32px)',
            px: 4,
            pt: 10,
            pb: 28,
            '& > *': {
              '&:first-child': { mt: 0 },
              '&:last-child': { mb: 0 }
            }
          }}
        >
          {children}
        </Stack>
      </Box>
    </>
  )
}
