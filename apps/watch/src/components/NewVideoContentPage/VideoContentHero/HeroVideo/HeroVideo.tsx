import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import 'videojs-mux'

import { usePlayer } from '../../../../libs/playerContext/PlayerContext'
import { useVideo } from '../../../../libs/videoContext'
import { VideoControls } from '../../../VideoContentPage/VideoHero/VideoPlayer/VideoControls'

interface HeroVideoProps {
  isFullscreen: boolean
}

export function HeroVideo({ isFullscreen }: HeroVideoProps): ReactElement {
  const { variant, ...video } = useVideo()
  const {
    state: { mute }
  } = usePlayer()
  const [playerReady, setPlayerReady] = useState(false)
  // Track if video was playing before scroll pause
  const [wasPlayingBeforeScrollPause, setWasPlayingBeforeScrollPause] =
    useState(false)
  // Ref: was pause triggered by scroll
  const pauseTriggeredByScrollRef = useRef(false)

  const title = video.title?.[0]?.value ?? ''

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)

  /**
   * Pause/resume video on scroll:
   * - Pause if scrolled > 100px and video was playing.
   * - Resume if scrolled to top and video was playing before scroll.
   */
  const pauseVideoOnScrollAway = useCallback((): void => {
    const scrollY = window.scrollY
    if (playerRef.current) {
      if (scrollY > 600) {
        // Pause only if playing
        if (!playerRef.current.paused()) {
          pauseTriggeredByScrollRef.current = true
          setWasPlayingBeforeScrollPause(true)
          playerRef.current.pause()
        }
      } else if (scrollY < 60) {
        // Resume if was playing before scroll
        if (wasPlayingBeforeScrollPause) {
          void playerRef.current.play()
        }
      }
    }
  }, [wasPlayingBeforeScrollPause])

  useEffect(() => {
    window.addEventListener('scroll', pauseVideoOnScrollAway)
    return () => window.removeEventListener('scroll', pauseVideoOnScrollAway)
  }, [pauseVideoOnScrollAway])

  useEffect(() => {
    if (!videoRef.current || !variant?.hls) return

    // Dispose of existing player before creating new one
    if (playerRef.current) {
      playerRef.current.dispose()
      playerRef.current = null
      setPlayerReady(false)
    }

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
      muted: mute,
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

    player.src({
      src: variant.hls,
      type: 'application/x-mpegURL'
    })

    /**
     * Sync with manual play/pause:
     * - Play: set true
     * - Pause: set false unless triggered by scroll
     */
    const handlePlay = () => {
      setWasPlayingBeforeScrollPause(true)
    }
    const handlePause = () => {
      if (pauseTriggeredByScrollRef.current) {
        pauseTriggeredByScrollRef.current = false
      } else {
        setWasPlayingBeforeScrollPause(false)
      }
    }
    player.on('play', handlePlay)
    player.on('pause', handlePause)

    player.ready(() => {
      setPlayerReady(true)
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.off('play', handlePlay)
        playerRef.current.off('pause', handlePause)
        playerRef.current.dispose()
        playerRef.current = null
      }
      setPlayerReady(false)
    }
  }, [variant?.hls, title, variant?.id])

  return (
    <div
      className={`fixed top-0 left-0 right-0 mx-auto z-0 vjs-hide-loading-spinners 
        [body[style*='padding-right']_&]:right-[15px]
        ${
          isFullscreen
            ? 'h-full max-w-full'
            : 'h-[90%] md:h-[80%] max-w-[1920px]'
        }`}
      data-testid="ContentHeroVideoContainer"
    >
      {variant?.hls && (
        <video
          key={variant.hls}
          data-testid="ContentHeroVideo"
          ref={videoRef}
          className="vjs [&_.vjs-tech]:object-contain [&_.vjs-tech]:md:object-cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          playsInline
        />
      )}
      {playerRef.current != null && playerReady && (
        <VideoControls player={playerRef.current} />
      )}
    </div>
  )
}
