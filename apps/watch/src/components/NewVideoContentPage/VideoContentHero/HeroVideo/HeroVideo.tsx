import clsx from 'clsx'
import last from 'lodash/last'
import { ReactElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import 'video.js/dist/video-js.css'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import 'videojs-mux'

import { usePlayer } from '../../../../libs/playerContext/PlayerContext'
import { useVideoCarousel } from '../../../../libs/videoCarouselContext'
import { useVideo } from '../../../../libs/videoContext'
import { useWatch } from '../../../../libs/watchContext'
import { useSubtitleUpdate } from '../../../../libs/watchContext/useSubtitleUpdate'
import { MuxInsertLogoOverlay, VideoControls } from '../../../VideoContentPage/VideoHero/VideoPlayer/VideoControls'

import { HeroSubtitleOverlay } from './HeroSubtitleOverlay'

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
  const { currentMuxInsert, handleMuxInsertComplete, handleSkipActiveVideo } = useVideoCarousel()
  const [playerReady, setPlayerReady] = useState(false)

  // Use Mux insert title if available, otherwise use regular video title
  const title = currentMuxInsert ? currentMuxInsert.overlay.title : (last(video.title)?.value ?? '')

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<
    (Player & { textTracks?: () => TextTrackList }) | null
  >(null)
  const fadeAnimationFrameRef = useRef<number | null>(null)
  const fadeActiveRef = useRef(false)
  const volumeToRestoreRef = useRef<number | null>(null)
  const [isFadingOut, setIsFadingOut] = useState(false)

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

    // Temporary: Add keyboard shortcut to seek near end for testing
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Cmd/Ctrl + Alt + Shift + Z (very specific combination to avoid conflicts)
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.shiftKey && e.key === 'Z' && playerRef.current) {
        e.preventDefault() // Prevent any default behavior
        const duration = playerRef.current.duration()
        if (duration && !isNaN(duration)) {
          const seekTime = Math.max(duration - 2, 0) // Seek to 2 seconds before end
          console.log('SEEKING TO NEAR END: seeking to', seekTime, 'out of', duration)
          playerRef.current.currentTime(seekTime)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('scroll', pauseVideoOnScrollAway)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [pauseVideoOnScrollAway])

  const resetFade = useCallback(() => {
    if (fadeAnimationFrameRef.current != null) {
      cancelAnimationFrame(fadeAnimationFrameRef.current)
      fadeAnimationFrameRef.current = null
    }

    fadeActiveRef.current = false
    setIsFadingOut(false)

    const player = playerRef.current
    if (
      player != null &&
      volumeToRestoreRef.current != null &&
      player.muted() === false
    ) {
      player.volume(volumeToRestoreRef.current)
    }

    volumeToRestoreRef.current = null
  }, [])

  const startFadeOut = useCallback(() => {
    const player = playerRef.current

    if (player == null || fadeActiveRef.current || isFadingOut) {
      return
    }

    const muted = player.muted()

    fadeActiveRef.current = true
    setIsFadingOut(true)

    if (!muted) {
      volumeToRestoreRef.current = player.volume()
    } else {
      volumeToRestoreRef.current = null
    }

    const startTime = performance.now()
    const duration = 2000
    const startVolume = muted ? 0 : player.volume()

    const step = (timestamp: number): void => {
      const currentPlayer = playerRef.current
      if (!fadeActiveRef.current || currentPlayer == null) {
        return
      }

      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const nextVolume = Math.max(startVolume * (1 - progress), 0)

      if (!currentPlayer.muted()) {
        currentPlayer.volume(nextVolume)
      }

      if (progress < 1) {
        fadeAnimationFrameRef.current = requestAnimationFrame(step)
      } else {
        fadeAnimationFrameRef.current = null
        fadeActiveRef.current = false
        if (!currentPlayer.muted()) {
          currentPlayer.volume(0)
        }
      }
    }

    fadeAnimationFrameRef.current = requestAnimationFrame(step)
  }, [isFadingOut])

  useLayoutEffect(() => {
    // Determine the video source and ID based on current content
    const videoSource = currentMuxInsert ? currentMuxInsert.urls.hls : variant?.hls
    const videoId = currentMuxInsert ? currentMuxInsert.id : variant?.id

    if (!videoRef.current || !videoSource) return

    // Dispose of existing player before creating new one
    if (playerRef.current) {
      resetFade()
      // Use setTimeout to defer disposal to next tick, avoiding React's current cleanup cycle
      setTimeout(() => {
        try {
          if (playerRef.current) {
            playerRef.current.dispose()
            playerRef.current = null
          }
        } catch (error) {
          console.warn('Video.js dispose warning during cleanup:', error)
        }
      }, 0)
      setPlayerReady(false)
    }

    // Create Mux metadata for video analytics
    const muxMetadata: MuxMetadata = {
      env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
      player_name: 'watch',
      video_title: title,
      video_id: videoId ?? ''
    }

    // Initialize player with deferred setup to avoid React conflicts
    setTimeout(() => {
      if (!videoRef.current || playerRef.current) return // Guard against race conditions

      try {
        const player = videojs(videoRef.current, {
          ...defaultVideoJsOptions,
          autoplay: true,
          controls: false,
          loop: !isPreview && !currentMuxInsert && false, // Don't loop Mux inserts - temporarily disabled for testing
          muted: false, // Start unmuted, mute state will be set by useEffect
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
          src: videoSource,
          type: 'application/x-mpegURL'
        })

        player.ready(() => {
          console.log('PLAYER READY - loop setting:', player.loop(), 'duration:', player.duration(), 'currentTime:', player.currentTime())
          setPlayerReady(true)
        })
      } catch (error) {
        console.warn('Video.js initialization error:', error)
      }
    }, 0)

    return () => {
      setPlayerReady(false)
      // Don't dispose here - let the setTimeout handle it to avoid React conflicts
    }
  }, [
    currentMuxInsert?.id,
    variant?.hls,
    title,
    variant?.id,
    currentMuxInsert,
    isPreview,
    resetFade
  ])

  // Handle mute state changes dynamically without recreating the player
  useEffect(() => {
    if (playerRef.current && playerReady) {
      playerRef.current.muted(mute)
    }
  }, [mute, playerReady])

  // Duration timer for Mux inserts
  useEffect(() => {
    if (!currentMuxInsert?.duration || !playerRef.current || !playerReady) {
      return
    }

    const timer = setTimeout(() => {
      handleMuxInsertComplete()
    }, currentMuxInsert.duration * 1000) // Convert seconds to milliseconds

    return () => {
      clearTimeout(timer)
    }
  }, [currentMuxInsert?.duration, currentMuxInsert?.id, playerReady, handleMuxInsertComplete])

  const { subtitleUpdate } = useSubtitleUpdate()

  const effectiveSubtitleLanguageId =
    subtitleLanguageId ?? variant?.language.id ?? null

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
    if (player == null || !playerReady) return

    void subtitleUpdate({
      player,
      subtitleLanguageId: effectiveSubtitleLanguageId,
      subtitleOn: mute || subtitleOn
    })
  }, [
    playerRef,
    playerReady,
    effectiveSubtitleLanguageId,
    subtitleOn,
    variant,
    mute
  ])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !playerReady) return

    const handleTimeUpdate = (): void => {
      if (player.paused()) return

      const playerWithRemaining = player as Player & {
        remainingTime?: () => number
      }

      const hasRemainingTime =
        typeof playerWithRemaining.remainingTime === 'function'

      const duration = typeof player.duration === 'function' ? player.duration() : 0
      const currentTime = typeof player.currentTime === 'function' ? player.currentTime() : 0
      const remainingTimeMethod = hasRemainingTime ? playerWithRemaining.remainingTime?.() : null
      const manualRemaining = Math.max(duration - currentTime, 0)

      const remaining = hasRemainingTime ? remainingTimeMethod : manualRemaining

      if (remaining != null && remaining <= 7) {
        startFadeOut()
      }
    }

    const handleReset = (): void => {
      resetFade()
    }

    player.on('timeupdate', handleTimeUpdate)
    player.on('playing', handleReset)
    player.on('loadstart', handleReset)
    player.on('seeking', handleReset)
    player.on('ended', () => {
      const duration = typeof player.duration === 'function' ? player.duration() : 0
      const currentTime = typeof player.currentTime === 'function' ? player.currentTime() : 0
      const remaining = Math.max(duration - currentTime, 0)
      console.log('VIDEO ENDED EVENT FIRED - remaining:', remaining, 'duration:', duration, 'currentTime:', currentTime)
      handleReset()
    })

    return () => {
      player.off('timeupdate', handleTimeUpdate)
      player.off('playing', handleReset)
      player.off('loadstart', handleReset)
      player.off('seeking', handleReset)
      player.off('ended', handleReset)
    }
  }, [playerReady, startFadeOut, resetFade])

  useEffect(() => {
    return () => {
      resetFade()
    }
  }, [resetFade])

  const shouldShowOverlay = playerReady && (mute || (subtitleOn ?? false))

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
        {(currentMuxInsert?.urls.hls || variant?.hls) && (
          <video
            key={currentMuxInsert ? currentMuxInsert.id : variant?.hls}
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
        <div
          data-testid="HeroVideoFadeOverlay"
          className={clsx(
            'absolute inset-0 z-1 pointer-events-none transition-opacity duration-2000 bg-black',
            isFadingOut ? 'opacity-100' : 'opacity-0'
          )}
        />
        {collapsed && (
          <div
            className="absolute inset-0 z-1 pointer-events-none opacity-70"
            style={{
              backdropFilter: 'brightness(.4) saturate(.6) sepia(.4)',
              backgroundImage: 'url(/assets/overlay.svg)',
              backgroundSize: '1600px auto'
            }}
          />
        )}
        <HeroSubtitleOverlay
          player={playerRef.current}
          subtitleLanguageId={effectiveSubtitleLanguageId}
          visible={shouldShowOverlay}
        />
        {playerRef.current != null && playerReady && (
          <>
            <VideoControls
              player={playerRef.current}
              isPreview={isPreview}
              onMuteToggle={onMuteToggle}
              customDuration={currentMuxInsert?.duration}
              action={currentMuxInsert?.overlay.action}
              isMuxInsert={currentMuxInsert != null}
              muxOverlay={currentMuxInsert?.overlay}
              onSkip={handleSkipActiveVideo}
            />
          </>
        )}
        <MuxInsertLogoOverlay variantId={currentMuxInsert ? `${currentMuxInsert.id}-variant` : variant?.id} />
      </>
    </div>
  )
}
