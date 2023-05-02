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
      <Stack
        justifyContent="flex-end"
        sx={{
          position: 'absolute',
          zIndex: 1,
          width: 'inherit',
          height: '100%'
        }}
      >
        {/* <Box
          sx={{
            display: 'flex',
            width: '100%',
            height: 30,
            background:
              backgroundBlur != null
                ? `linear-gradient(to top, ${backgroundBlur}4d 95%, ${backgroundBlur}00 100%)`
                : 'unset'
          }}
        /> */}
        <Stack
          sx={{
            justifyContent: 'flex-end',
            width: 'calc(100% - 32px)',
            WebkitBackdropFilter: 'blur(20px)',
            backdropFilter: 'blur(20px)',
            maxHeight: 'calc(50% - 100px)',
            background:
              backgroundBlur != null
                ? `linear-gradient(to top, ${backgroundBlur} 0%, ${backgroundBlur}f2 55%, ${backgroundBlur}ab 80%, ${backgroundBlur}73 100%)`
                : 'unset',
            px: 4,
            pt: 6,
            pb: 28
          }}
        >
          <Box
            sx={{
              overflowY: 'scroll',
              // Hide on Firefox https://caniuse.com/?search=scrollbar-width
              scrollbarWidth: 'none',
              // Hide on all others https://caniuse.com/?search=webkit-scrollbar
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              '& > *': {
                '&:first-child': { mt: 0 },
                '&:last-child': { mb: 0 }
              }
            }}
          >
            {children}
          </Box>
        </Stack>
      </Stack>
    </>
  )
}
