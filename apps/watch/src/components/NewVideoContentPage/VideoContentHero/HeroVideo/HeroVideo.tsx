import last from 'lodash/last'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import 'videojs-mux'

import { usePlayer } from '../../../../libs/playerContext/PlayerContext'
import { useVideo } from '../../../../libs/videoContext'
import { useWatch } from '../../../../libs/watchContext'
import { useSubtitleUpdate } from '../../../../libs/watchContext/useSubtitleUpdate'
import { VideoControls } from '../../../VideoContentPage/VideoHero/VideoPlayer/VideoControls'

import clsx from 'clsx'

interface HeroVideoProps {
  isPreview?: boolean
  collapsed?: boolean
  onMuteToggle?: (isMuted: boolean) => void
}

export function HeroVideo({
  isPreview = false,
  collapsed = true,
  onMuteToggle
}: HeroVideoProps): ReactElement {
  const { variant, ...video } = useVideo()
  const {
    state: { mute },
    dispatch: dispatchPlayer
  } = usePlayer()
  const {
    state: { subtitleLanguageId, subtitleOn }
  } = useWatch()
  const [playerReady, setPlayerReady] = useState(false)

  const title = last(video.title)?.value ?? ''

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<
    (Player & { textTracks?: () => TextTrackList }) | null
  >(null)

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
    window.addEventListener('scroll', pauseVideoOnScrollAway, { passive: true })
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
      loop: !isPreview,
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

    player.ready(() => {
      setPlayerReady(true)
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
      setPlayerReady(false)
    }
  }, [variant?.hls, title, variant?.id])

  const { subtitleUpdate } = useSubtitleUpdate()

  const handlePreviewClick = useCallback(
    (e: React.MouseEvent<HTMLVideoElement>) => {
      e.stopPropagation()
      const newMuteState = !mute
      playerRef.current?.muted(newMuteState)
      dispatchPlayer({ type: 'SetMute', mute: newMuteState })
      onMuteToggle?.(newMuteState)
    },
    [mute, dispatchPlayer, onMuteToggle]
  )

  useEffect(() => {
    const player = playerRef.current
    if (player == null) return

    void subtitleUpdate({
      player,
      subtitleLanguageId,
      subtitleOn: mute || subtitleOn
    })
  }, [playerRef, subtitleLanguageId, subtitleOn, variant, mute])

  return (
    <div
      className={clsx(
        "fixed top-0 left-0 right-0 mx-auto z-0 vjs-hide-loading-spinners [body[style*='padding-right']_&]:right-[15px]",
        {
          'preview-video': isPreview && collapsed,
          'h-[90%] md:h-[80%] max-w-[1920px]': !isPreview || !collapsed
        }
      )}
      data-testid="ContentHeroVideoContainer"
    >
      <>
        {variant?.hls && (
          <video
            key={variant.hls}
            data-testid="ContentHeroVideo"
            ref={videoRef}
            className={clsx(
              'vjs [&_.vjs-tech]:object-contain [&_.vjs-tech]:md:object-cover',
              { 'cursor-pointer': isPreview }
            )}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
            playsInline
            onClick={isPreview ? handlePreviewClick : undefined}
          />
        )}
        {collapsed && (
          <div
            className="absolute inset-0 z-1 pointer-events-none opacity-70"
            style={{
              backdropFilter: 'brightness(.4) saturate(.6) sepia(.4)',
              backgroundImage: 'url(/watch/assets/overlay.svg)',
              backgroundSize: '1600px auto'
            }}
          />
        )}
        {playerRef.current != null && playerReady && (
          <>
            <VideoControls
              player={playerRef.current}
              isPreview={isPreview}
              onMuteToggle={onMuteToggle}
            />
          </>
        )}
      </>
    </div>
  )
}
