import Box from '@mui/material/Box'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import 'videojs-mux'

import { useVideo } from '../../../../libs/videoContext'
import { VideoControls } from '../../../VideoContentPage/VideoHero/VideoPlayer/VideoControls'

interface ContentHeroVideoProps {
  onPlayerReady: (player: Player) => void
}

export function ContentHeroVideo({
  onPlayerReady
}: ContentHeroVideoProps): ReactElement {
  const { variant, ...video } = useVideo()

  const title = video.title?.[0]?.value ?? ''

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)

  const pauseVideoOnScrollAway = useCallback((): void => {
    const scrollY = window.scrollY
    if (playerRef.current) {
      if (scrollY > 100) {
        playerRef.current.pause()
      } else if (scrollY === 0) {
        void playerRef.current.play()
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', pauseVideoOnScrollAway)
    return () => window.removeEventListener('scroll', pauseVideoOnScrollAway)
  }, [pauseVideoOnScrollAway])

  useEffect(() => {
    if (!videoRef.current) return
    // Create Mux metadata for video analytics
    const muxMetadata: MuxMetadata = {
      env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
      player_name: 'watch',
      video_title: title,
      video_id: variant?.id ?? ''
    }

    // Initialize player
    const player = videojs(videoRef.current, {
      ...defaultVideoJsOptions,
      autoplay: true,
      controls: false,
      loop: true,
      muted: true,
      fluid: false,
      fill: true,
      responsive: false,
      aspectRatio: undefined,
      plugins: {
        mux: {
          debug: false,
          data: muxMetadata
        }
      }
    })

    playerRef.current = player
    onPlayerReady(player)
  }, [onPlayerReady, variant])

  useEffect(() => {
    void playerRef.current?.src({
      src: variant?.hls ?? '',
      type: 'application/x-mpegURL'
    })
  }, [variant?.hls])

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: {
          xs: '90%',
          md: '80%'
        },
        maxWidth: 1920,
        marginX: 'auto',
        zIndex: 0,
        '.vjs-hidden': { display: 'none' },
        '.vjs-loading-spinner, .vjs-seeking .vjs-loading-spinner, .vjs-waiting .vjs-loading-spinner':
          { display: 'none' }
      }}
      data-testid="ContentHeroVideoContainer"
    >
      <video
        data-testid="ContentHeroVideo"
        ref={videoRef}
        className="vjs"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        playsInline
      />
      {playerRef.current != null && (
        <VideoControls player={playerRef.current} />
      )}
    </Box>
  )
}
