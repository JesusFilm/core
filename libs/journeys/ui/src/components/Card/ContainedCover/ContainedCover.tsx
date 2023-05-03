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
  const [player, setPlayer] = useState<VideoJsPlayer>()
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
                      xs: 'scale(3.65)',
                      md: 'scale(3.1)',
                      lg: 'scale(2)',
                      xl: 'scale(1.6)'
                    }
                  : 'unset'
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
        justifyContent="flex-end"
        alignItems={{ xs: 'flex-end', md: 'flex-end' }}
        sx={{
          position: 'absolute',
          zIndex: 1,
          width: 'inherit',
          height: '100%'
        }}
      >
        <Stack
          justifyContent="center"
          sx={{
            width: '100%',
            maxWidth: { xs: '100%', md: '340px' },
            WebkitBackdropFilter: 'blur(20px)',
            backdropFilter: 'blur(20px)',
            height: { md: '100%' },
            maxHeight: { xs: 'calc(50% - 80px)', md: '100%' },
            background:
              backgroundBlur != null
                ? {
                    xs: `linear-gradient(to top, ${backgroundBlur} 0%, ${backgroundBlur}f2 55%, ${backgroundBlur}ab 80%, ${backgroundBlur}73 100%)`,
                    // TODO: Tweak
                    md: `linear-gradient(to top, ${backgroundBlur} 0%, ${backgroundBlur}f2 55%, ${backgroundBlur}ab 80%, ${backgroundBlur}73 100%)`
                  }
                : 'unset',
            pt: { xs: 6, md: 0 },
            pb: { xs: 28, md: 0 }
          }}
        >
          <Box
            sx={{
              px: { xs: 4, md: 14 },
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
