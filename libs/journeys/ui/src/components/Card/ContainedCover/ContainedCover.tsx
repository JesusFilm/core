import {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
  CSSProperties
} from 'react'
import videojs, { VideoJsPlayer } from 'video.js'
import { NextImage } from '@core/shared/ui/NextImage'
import { styled } from '@mui/material/styles'
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
import { useJourney } from '../../../libs/JourneyProvider'

interface ContainedCoverProps {
  children: ReactNode[]
  videoBlock?: TreeBlock<VideoFields>
  imageBlock?: TreeBlock<ImageFields>
  backgroundBlur: string
}

const StyledVideo = styled('video')(() => ({}))

const StyledGradientBackground = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  zIndex: 0,
  width: '100%',
  height: '200px',
  background: `linear-gradient(to top, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper}f2 20%, ${theme.palette.background.paper}bf 40%, ${theme.palette.background.paper}1a 85%, ${theme.palette.background.paper}00 100%)`
}))

const StyledBlurBackground = styled(Stack)(({ theme }) => ({
  justifyContent: 'flex-end',
  flexDirection: 'row',
  position: 'absolute',
  zIndex: 0,
  width: '100%',
  WebkitBackdropFilter: 'blur(4px)',
  backdropFilter: 'blur(4px)'
}))

export function ContainedCover({
  children,
  backgroundBlur,
  videoBlock,
  imageBlock
}: ContainedCoverProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [player, setPlayer] = useState<VideoJsPlayer>()
  const [loading, setLoading] = useState(true)
  const [contentHeight, setContentHeight] = useState(0)
  const { admin } = useJourney()
  const contentRef = useRef()

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
      setPlayer(
        videojs(videoRef.current, {
          autoplay: !isYouTubeAndiOS,
          controls: false,
          controlBar: false,
          bigPlayButton: false,
          preload: 'metadata',
          // Make video fill container instead of set aspect ratio
          fill: true,
          userActions: {
            hotkeys: false,
            doubleClick: false
          },
          responsive: true,
          muted: true,
          loop: true
        })
      )
    }
  }, [isYouTube])

  useEffect(() => {
    if (player != null) {
      player.on('ready', () => {
        player?.currentTime(videoBlock?.startAt ?? 0)
        // plays youTube videos at the start time
        if (videoBlock?.source === VideoBlockSource.youTube) void player?.play()
      })
      // Video jumps to new time and finishes loading
      player.on('seeked', () => {
        setLoading(false)
      })
      player.on('timeupdate', () => {
        if (
          videoBlock?.startAt != null &&
          videoBlock?.endAt != null &&
          videoBlock?.endAt > 0 &&
          player != null
        ) {
          const currentTime = player.currentTime()
          const { startAt, endAt } = videoBlock
          if (currentTime < (startAt ?? 0) || currentTime >= endAt) {
            player.currentTime(startAt ?? 0)
          }
        }
      })
    }
  }, [player, videoBlock])

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

  //  Set video src
  useEffect(() => {
    if (player != null && videoBlock != null) {
      if (
        videoBlock.source === VideoBlockSource.internal &&
        videoBlock.video?.variant?.hls != null
      ) {
        player.src({
          src: videoBlock.video.variant?.hls ?? '',
          type: 'application/x-mpegURL'
        })
      } else if (
        videoBlock.source === VideoBlockSource.youTube &&
        videoBlock.videoId != null
      ) {
        player.src({
          src: `https://www.youtube.com/watch?v=${videoBlock?.videoId}`,
          type: 'video/youtube'
        })
      }
    }
  }, [player, videoBlock])

  useEffect(() => {
    if (contentRef.current != null)
      setContentHeight((contentRef.current as HTMLDivElement).clientHeight ?? 0)
  }, [contentRef])

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
              '&.video-js.vjs-fill:not(.vjs-audio-only-mode)': {
                height: isYouTube ? 'inherit' : '100%',
                transform: isYouTube
                  ? {
                      xs: 'scale(4)',
                      sm: 'scale(1.3)',
                      md: 'scale(2.65)',
                      lg: 'scale(1.2)'
                    }
                  : 'unset',
                bottom: { xs: children.length !== 0 ? 50 : 0, lg: 0 }
              },
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
          />
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
              style={{ transform: isYouTube ? 'scale(1.35)' : 'unset' }}
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
        className="overlay-container"
        justifyContent="flex-end"
        alignItems="flex-end"
        sx={{
          position: 'absolute',
          zIndex: 1,
          width: '100%',
          height: '100%'
        }}
      >
        {children.length !== 0 ? (
          <>
            <StyledBlurBackground
              className="overlay-blur"
              sx={{
                height: contentHeight - 40,
                WebkitBackdropFilter: 'blur(1px)',
                backdropFilter: 'blur(1px)'
              }}
            />
            <StyledBlurBackground
              className="overlay-blur"
              sx={{
                height: contentHeight - 80,
                WebkitBackdropFilter: 'blur(1px)',
                backdropFilter: 'blur(1px)'
              }}
            />
            <StyledBlurBackground
              className="overlay-blur"
              sx={{
                height: contentHeight * 0.9 - 80,
                WebkitBackdropFilter: 'blur(2px)',
                backdropFilter: 'blur(2px)'
              }}
            />
            <StyledBlurBackground
              className="overlay-blur"
              sx={{ height: contentHeight * 0.8 - 80 }}
            />
            <StyledBlurBackground
              className="overlay-blur"
              sx={{ height: contentHeight * 0.7 - 80 }}
            />
            <StyledBlurBackground
              className="overlay-blur"
              sx={{ height: contentHeight * 0.6 - 80 }}
            />
            <StyledBlurBackground
              className="overlay-blur"
              sx={{ height: contentHeight * 0.5 - 80 }}
            />
            <Stack
              ref={contentRef}
              className="overlay-gradient"
              flexDirection="row"
              justifyContent="center"
              sx={{
                position: 'absolute',
                zIndex: 1,
                width: '100%',
                maxWidth: { xs: '100%', lg: '380px' },
                maxHeight: { xs: 'calc(55% - 80px)', lg: '100%' },
                borderBottomLeftRadius: admin ? 16 : 0,
                borderBottomRightRadius: admin ? 16 : 0,
                pt: { xs: 30, lg: 0 },
                pb: { xs: 22, lg: 0 },
                WebkitMask: `linear-gradient(transparent 0%,  ${backgroundBlur}14 10%, ${backgroundBlur}33 15%, ${backgroundBlur}60 20%, ${backgroundBlur}b0 30%, ${backgroundBlur}e6 40%, ${backgroundBlur} 98%)`,
                mask: `linear-gradient(transparent 0%,  ${backgroundBlur}14 10%, ${backgroundBlur}33 15%, ${backgroundBlur}60 20%, ${backgroundBlur}b0 30%, ${backgroundBlur}e6 40%, ${backgroundBlur} 98%)`,
                backgroundColor: ` ${backgroundBlur}fc`
              }}
            >
              <Box
                className="overlay-content"
                sx={{
                  height: 'inherit',
                  px: { xs: 6, lg: 10 },

                  overflowY: 'scroll',
                  WebkitMask: `linear-gradient(transparent 0%, ${backgroundBlur}1a 4%,${backgroundBlur} 8%, ${backgroundBlur} 90%, ${backgroundBlur}1a 96%, transparent 100%)`,
                  mask: `linear-gradient(transparent 0%, ${backgroundBlur}1a 4%,${backgroundBlur} 8%, ${backgroundBlur} 90%, ${backgroundBlur}1a 96%, transparent 100%)`,
                  // Hide on Firefox https://caniuse.com/?search=scrollbar-width
                  scrollbarWidth: 'none',
                  zIndex: 1,
                  // Hide on all others https://caniuse.com/?search=webkit-scrollbar
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  },
                  '& > *': {
                    '&:first-child': { mt: 6 },
                    '&:last-child': { mb: 6 }
                  }
                }}
              >
                {children}
              </Box>
            </Stack>
          </>
        ) : (
          <StyledGradientBackground className="overlay-gradient" />
        )}
      </Stack>
    </>
  )
}
