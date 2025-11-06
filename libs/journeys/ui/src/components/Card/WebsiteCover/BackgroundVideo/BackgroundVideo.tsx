import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { ReactElement, useEffect, useRef } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultBackgroundVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'

import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../libs/block'
import { VideoFields } from '../../../Video/__generated__/VideoFields'

import 'videojs-youtube'
import 'video.js/dist/video-js.css'

interface BackgroundVideoProps extends TreeBlock<VideoFields> {
  setLoading: (loading: boolean) => void
  cardColor: string
}

const StyledVideo = styled('video')(() => ({}))

export function BackgroundVideo({
  source,
  mediaVideo,
  videoId,
  startAt,
  endAt,
  setLoading
}: BackgroundVideoProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)
  const isYouTube = source === VideoBlockSource.youTube

  // Initiate Video
  useEffect(() => {
    // Don't initialize video player if there's no videoId (e.g., in admin mode)
    if (videoRef.current != null && (videoId != null || mediaVideo != null)) {
      playerRef.current = videojs(videoRef.current, {
        ...defaultBackgroundVideoJsOptions,
        autoplay: true,
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
        muted: true,
        loop: true,
        responsive: true
        // Don't use poster prop as image isn't optimised
      })
    }
  }, [videoId, mediaVideo])

  // Set up video listeners
  useEffect(() => {
    const player = playerRef.current
    if (player != null && (videoId != null || mediaVideo != null)) {
      // Video jumps to new time and finishes loading
      player.on('ready', () => {
        player.currentTime(startAt ?? 0)
        void player.play()
      })
      player.on('seeked', () => {
        setLoading(false)
      })
      player.on('pause', () => {
        // Loop video if at end
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

      player.ready(() => {
        if (
          mediaVideo?.__typename === 'MuxVideo' &&
          mediaVideo?.playbackId != null
        ) {
          player.src({
            src: `https://stream.mux.com/${mediaVideo.playbackId}.m3u8`,
            type: 'application/x-mpegURL'
          })
        }
        if (
          mediaVideo?.__typename === 'Video' &&
          mediaVideo?.variant?.hls != null
        ) {
          player.src({
            src: mediaVideo.variant.hls,
            type: 'application/x-mpegURL'
          })
        }
      })
    }
  }, [playerRef, startAt, endAt, source, mediaVideo, videoId, setLoading])

  useEffect(() => {
    if (videoRef.current != null) videoRef.current.pause()
  }, [])

  return (
    <Box
      height="100%"
      width="100%"
      minHeight="-webkit-fill-available"
      overflow="hidden"
      position="absolute"
      data-testid="WebsiteCoverBackgroundVideo"
    >
      <StyledVideo
        ref={videoRef}
        data-testid="background-video"
        className="vjs-fill video-js"
        playsInline
        sx={{
          '&.video-js.vjs-fill:not(.vjs-audio-only-mode)': {
            height: '100%',
            transform: isYouTube ? 'scale(3)' : 'unset',
            bottom: 0
          },
          '> .vjs-tech': {
            objectFit: 'cover'
          },
          '> .vjs-loading-spinner': {
            zIndex: 1,
            display: isYouTube ? 'none' : 'flex'
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

