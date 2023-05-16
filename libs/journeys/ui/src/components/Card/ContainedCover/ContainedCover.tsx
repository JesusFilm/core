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
  height: '300px',
  background: `linear-gradient(to top,  ${theme.palette.background.paper}cc 0%, ${theme.palette.background.paper}33 60%, ${theme.palette.background.paper}00 100%)`,
  [theme.breakpoints.up('lg')]: {
    background: 'unset'
  }
}))

const StyledBlurBackground = styled(Stack)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  WebkitBackdropFilter: 'blur(2px)',
  backdropFilter: 'blur(2px)',
  [theme.breakpoints.up('lg')]: {
    height: '100%'
  }
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
    if (contentRef.current != null) {
      setContentHeight(
        (contentRef.current as unknown as HTMLDivElement).clientHeight ?? 0
      )
    }
  }, [contentRef])

  const overlayGradient = (direction: string): string =>
    `linear-gradient(to ${direction}, transparent 0%,  ${backgroundBlur}14 10%, ${backgroundBlur}33 17%, ${backgroundBlur}60 25%, ${backgroundBlur}b0 40%, ${backgroundBlur}e6 60%, ${backgroundBlur} 98%)`

  const overlayImageMask = `linear-gradient(to top, transparent 0%, ${backgroundBlur}14 5%, ${backgroundBlur}33 10%, ${backgroundBlur}60 15%, ${backgroundBlur}b0 20%, ${backgroundBlur}e6 25%, ${backgroundBlur} 30%)`

  return (
    <>
      <Box
        data-testid="ContainedCover"
        sx={{
          width: '100%',
          height: '100%',
          position: 'absolute'
        }}
      >
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
        {/* Background image */}
        {backgroundBlur != null &&
          videoBlock == null &&
          imageBlock != null &&
          loading && (
            <>
              <NextImage
                data-testid="background-image"
                src={imageBlock?.src ?? backgroundBlur}
                alt={imageBlock.alt}
                placeholder="blur"
                blurDataURL={backgroundBlur}
                layout="fill"
                objectFit="cover"
                priority
                style={{ transform: 'scale(2) translate(0px, -25%)' }}
              />
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backdropFilter: 'blur(60px)'
                }}
              />
            </>
          )}
      </Box>
      {/* Overlay Cover Image */}
      {backgroundBlur != null &&
        videoBlock == null &&
        imageBlock != null &&
        loading && (
          <Stack
            data-testid="overlay-image-container"
            sx={{
              width: '100%',
              height: '100%',
              flexGrow: 1,
              zIndex: { xs: 2, lg: 0 },
              position: { xs: 'relative', lg: 'absolute' },
              WebkitMask: overlayImageMask,
              mask: overlayImageMask
            }}
          >
            <NextImage
              className="overlay-image"
              src={imageBlock?.src ?? backgroundBlur}
              alt={imageBlock.alt}
              placeholder="blur"
              blurDataURL={backgroundBlur}
              layout="fill"
              objectFit="cover"
              priority
            />
          </Stack>
        )}
      <Stack
        className="overlay-content-container"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: { lg: '100%' },
          justifyContent: { xs: 'flex-end', lg: 'center' },
          alignItems: { lg: 'flex-end' }
        }}
      >
        {children.length !== 0 ? (
          <>
            <Stack
              className="overlay-blur"
              sx={{
                width: { xs: videoBlock != null ? '100%' : '0%', lg: 380 },
                height: { xs: videoBlock != null ? '85%' : '0%', lg: '100%' },
                flexDirection: { lg: 'row' },
                justifyContent: 'flex-end',
                position: 'absolute'
              }}
            >
              <StyledBlurBackground
                sx={{
                  width: { lg: 500 },
                  height: contentHeight - 40,
                  WebkitBackdropFilter: 'blur(1px)',
                  backdropFilter: 'blur(1px)'
                }}
              />
              <StyledBlurBackground
                sx={{
                  width: { lg: 450 },
                  height: contentHeight - 80,
                  WebkitBackdropFilter: 'blur(1px)',
                  backdropFilter: 'blur(1px)'
                }}
              />
              <StyledBlurBackground
                sx={{
                  width: { lg: 400 },
                  height: contentHeight * 0.9 - 80,
                  WebkitBackdropFilter: 'blur(1px)',
                  backdropFilter: 'blur(1px)'
                }}
              />
              <StyledBlurBackground
                sx={{
                  width: { lg: 350 },
                  height: contentHeight * 0.8 - 80
                }}
              />
              <StyledBlurBackground
                sx={{ width: { lg: 325 }, height: contentHeight * 0.7 - 80 }}
              />
              <StyledBlurBackground
                sx={{ width: { lg: 275 }, height: contentHeight * 0.6 - 80 }}
              />
              <StyledBlurBackground
                sx={{ width: { lg: 250 }, height: contentHeight * 0.5 - 80 }}
              />
            </Stack>

            <Stack
              ref={contentRef}
              className="overlay-gradient"
              flexDirection="row"
              justifyContent="center"
              sx={{
                position: 'absolute',
                zIndex: 1,
                width: '100%',
                // TODO: admin height is different
                height: { xs: admin ? '150%' : '100%', lg: '100%' },
                maxWidth: { xs: '100%', lg: '380px' },
                borderBottomLeftRadius: admin ? 16 : 0,
                borderBottomRightRadius: admin ? 16 : 0,
                pt: { xs: videoBlock != null ? 40 : 5, lg: 0 },
                pb: { xs: 10, lg: 0 },
                pl: { lg: 50 },
                WebkitMask: {
                  xs: overlayGradient('bottom'),
                  lg: overlayGradient('right')
                },
                mask: {
                  xs: overlayGradient('bottom'),
                  lg: overlayGradient('right')
                },
                backgroundColor: `${backgroundBlur}d9`
              }}
            />
            <Box
              className="overlay-content"
              sx={{
                // This should match width of journey card content in admin
                width: { lg: '312px' },
                maxHeight: { xs: '45vh', lg: '100%' },
                px: { xs: 6, lg: 10 },
                mb: { xs: 9, lg: 0 },
                overflowY: 'scroll',
                WebkitMask: `linear-gradient(transparent 0%, #0000001a 4%, #000000 8%, #000000 90%, #0000001a 98%, transparent 100%)`,
                mask: `linear-gradient(transparent 0%, #0000001a 4%, #000000 8%, #000000 90%, #0000001a 98%, transparent 100%)`,
                zIndex: 1,
                // Hide on Firefox https://caniuse.com/?search=scrollbar-width
                scrollbarWidth: 'none',
                // Hide on all others https://caniuse.com/?search=webkit-scrollbar
                '&::-webkit-scrollbar': {
                  display: 'none'
                },
                '& > *': {
                  '&:first-child': { mt: { xs: 6, lg: 12 } },
                  '&:last-child': { mb: { xs: 6, lg: 12 } }
                }
              }}
            >
              {children}
            </Box>
          </>
        ) : (
          <StyledGradientBackground className="overlay-gradient" />
        )}
      </Stack>
    </>
  )
}
