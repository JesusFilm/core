import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { CSSProperties, ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import {
  VideoBlockObjectFit,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'
import { VideoFields } from '../../../Video/__generated__/VideoFields'

import 'videojs-youtube'
import 'video.js/dist/video-js.css'
// import '../../../Video/plugins/qualityOptimizer'
import '../../../Video/plugins/qualityOptimizerV2'
import VideoJsPlayer from '../../../Video/utils/videoJsTypes'

videojs.log.level('debug')

interface BackgroundVideoProps extends TreeBlock<VideoFields> {
  setLoading: (loading: boolean) => void
  cardColor: string
}

const StyledVideo = styled('video')(() => ({}))

export function BackgroundVideo({
  source,
  children,
  mediaVideo,
  videoId,
  startAt,
  endAt,
  objectFit,
  setLoading
}: BackgroundVideoProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<VideoJsPlayer>()
  const isYouTube = source === VideoBlockSource.youTube

  // Initiate Video
  useEffect(() => {
    if (videoRef.current != null) {
      const player = videojs(videoRef.current, {
        ...defaultVideoJsOptions,
        autoplay: true,
        controls: false,
        controlBar: false,
        bigPlayButton: false,
        preload: 'metadata',
        // Make video fill container instead of set aspect ratio
        debug: true,
        fill: true,
        userActions: {
          hotkeys: false,
          doubleClick: false
        },
        muted: true,
        // loop: true,
        responsive: true
        // Don't use poster prop as image isn't optimised
      })

      player.qualityOptimizer()

      playerRef.current = player
    }
  }, [])

  // Set up video listeners
  useEffect(() => {
    const player = playerRef.current
    if (player != null) {
      // Video jumps to new time and finishes loading
      player.on('ready', () => {
        player.currentTime(startAt ?? 0)
        void player.play()
      })
      player.on('seeked', () => {
        setLoading(false)
      })
      player.on('pause', () => {
        // 2) Loop video if at end
        const currentTime = player.currentTime() ?? 0
        if (
          currentTime < (startAt ?? 0) ||
          (endAt != null && currentTime >= endAt)
        ) {
          player?.currentTime(startAt ?? 0)
          void player?.play()
        }
      })
      player.on('timeupdate', () => {
        const currentTime = player?.currentTime() ?? 0
        if (
          currentTime < (startAt ?? 0) ||
          (endAt != null && currentTime >= endAt)
        ) {
          player?.pause()
        }
      })
    }
  }, [playerRef, startAt, endAt, source, mediaVideo, videoId, setLoading])

  useEffect(() => {
    if (videoRef.current != null) videoRef.current.pause()
  }, [])

  let videoFit: CSSProperties['objectFit']
  if (source === VideoBlockSource.youTube) {
    videoFit = 'contain'
  } else {
    switch (objectFit) {
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
    <Box
      height="100%"
      width="100%"
      minHeight="-webkit-fill-available"
      overflow="hidden"
      position="absolute"
      data-testid="CardContainedBackgroundVideo"
    >
      <StyledVideo
        ref={videoRef}
        data-testid="background-video"
        className="vjs-fill video-js"
        playsInline
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
              objectFit === VideoBlockObjectFit.zoomed
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
        {mediaVideo?.__typename === 'Video' &&
          mediaVideo?.variant?.hls != null && (
            <source src={mediaVideo.variant.hls} type="application/x-mpegURL" />
          )}
        {source === VideoBlockSource.youTube && videoId != null && (
          <source
            src={`https://www.youtube.com/embed/${videoId}?start=${
              startAt ?? 0
            }&end=${endAt ?? 0}`}
            type="video/youtube"
          />
        )}
        {mediaVideo?.__typename === 'MuxVideo' &&
          mediaVideo?.playbackId != null && (
            <source
              src={`https://stream.mux.com/${mediaVideo.playbackId}.m3u8`}
              type="application/x-mpegURL"
            />
          )}
      </StyledVideo>
    </Box>
  )
}
