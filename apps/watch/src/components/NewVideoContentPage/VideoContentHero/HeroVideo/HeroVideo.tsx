import clsx from 'clsx'
import last from 'lodash/last'
import {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
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
import type { CarouselMuxSlide } from '../../../../types/inserts'
import { MuxInsertLogoOverlay, VideoControls } from '../../../VideoContentPage/VideoHero/VideoPlayer/VideoControls'

import { HeroSubtitleOverlay } from './HeroSubtitleOverlay'

interface HeroVideoProps {
  isPreview?: boolean
  collapsed?: boolean
  onMuteToggle?: (isMuted: boolean) => void
  currentMuxInsert?: CarouselMuxSlide | null
  onMuxInsertComplete?: () => void
  onSkip?: () => void
}

export function HeroVideo({
  isPreview = false,
  collapsed = true,
  onMuteToggle,
  currentMuxInsert,
  onMuxInsertComplete,
  onSkip
}: HeroVideoProps): ReactElement {
  const { variant, ...video } = useVideo()
  const {
    state: { mute, progress },
    dispatch: dispatchPlayer
  } = usePlayer()
  const {
    state: { subtitleLanguageId, subtitleOn }
  } = useWatch()
  const [playerReady, setPlayerReady] = useState(false)

  // Use Mux insert title if available, otherwise use regular video title
  const title = currentMuxInsert ? currentMuxInsert.overlay.title : (last(video.title)?.value ?? '')

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<
    (Player & { textTracks?: () => TextTrackList }) | null
  >(null)
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const muxInsertFadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const originalVolumeRef = useRef<number | null>(null)
  const shouldRestoreVolumeRef = useRef(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  const clearFadeTimers = useCallback(() => {
    if (fadeIntervalRef.current != null) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }
    if (fadeTimeoutRef.current != null) {
      clearTimeout(fadeTimeoutRef.current)
      fadeTimeoutRef.current = null
    }
    if (muxInsertFadeTimeoutRef.current != null) {
      clearTimeout(muxInsertFadeTimeoutRef.current)
      muxInsertFadeTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearFadeTimers()
    }
  }, [clearFadeTimers])

  const startFadeOut = useCallback(() => {
    const player = playerRef.current
    if (player == null || isFadingOut) return

    setIsFadingOut(true)
    clearFadeTimers()

    if (!player.muted()) {
      const startingVolume = player.volume()
      if (startingVolume > 0) {
        originalVolumeRef.current = startingVolume
        shouldRestoreVolumeRef.current = true
        const fadeDurationMs = 800
        const steps = 8
        const stepInterval = fadeDurationMs / steps
        let currentStep = 0

        fadeIntervalRef.current = setInterval(() => {
          currentStep += 1
          const activePlayer = playerRef.current
          if (activePlayer == null || activePlayer !== player) {
            if (fadeIntervalRef.current != null) {
              clearInterval(fadeIntervalRef.current)
              fadeIntervalRef.current = null
            }
            return
          }

          const progressRatio = Math.min(currentStep / steps, 1)
          const nextVolume = Math.max(
            0,
            startingVolume * (1 - progressRatio)
          )
          activePlayer.volume(nextVolume)

          if (currentStep >= steps && fadeIntervalRef.current != null) {
            clearInterval(fadeIntervalRef.current)
            fadeIntervalRef.current = null
          }
        }, stepInterval)
      }
    } else {
      shouldRestoreVolumeRef.current = false
      originalVolumeRef.current = null
    }

    fadeTimeoutRef.current = setTimeout(() => {
      clearFadeTimers()
    }, 1500)
  }, [clearFadeTimers, isFadingOut])

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

  // Immediately hide native subtitles when video element is available
  useEffect(() => {
    if (videoRef.current == null) return

    const videoElement = videoRef.current
    const hideNativeSubtitles = () => {
      // Add CSS class immediately
      videoElement.classList.add('hero-hide-native-subtitles')

      // Disable any existing text tracks
      const tracks = videoElement.textTracks
      if (tracks != null) {
        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i]
          if (track.kind === 'subtitles') {
            track.mode = 'disabled'
          }
        }
      }
    }

    // Hide immediately and also on any track additions
    hideNativeSubtitles()

    const handleLoadStart = () => hideNativeSubtitles()
    const handleLoadedMetadata = () => hideNativeSubtitles()
    const handleCanPlay = () => hideNativeSubtitles()
    const handleAddTrack = () => {
      // Small delay to ensure track is fully added
      setTimeout(hideNativeSubtitles, 10)
    }

    videoElement.addEventListener('loadstart', handleLoadStart)
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
    videoElement.addEventListener('canplay', handleCanPlay)
    videoElement.textTracks.addEventListener?.('addtrack', handleAddTrack)

    return () => {
      videoElement.removeEventListener('loadstart', handleLoadStart)
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      videoElement.removeEventListener('canplay', handleCanPlay)
      videoElement.textTracks.removeEventListener?.('addtrack', handleAddTrack)
    }
  }, [videoRef.current])

  useEffect(() => {
    // Determine the video source and ID based on current content
    const videoSource = currentMuxInsert ? currentMuxInsert.urls.hls : variant?.hls
    const videoId = currentMuxInsert ? currentMuxInsert.id : variant?.id

    if (!videoRef.current || !videoSource) return

    // Dispose of existing player before creating new one
    if (playerRef.current) {
      playerRef.current.dispose()
      playerRef.current = null
      setPlayerReady(false)
      setIsFadingOut(false)
      shouldRestoreVolumeRef.current = false
      originalVolumeRef.current = null
    }

    // Create Mux metadata for video analytics
    const muxMetadata: MuxMetadata = {
      env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
      player_name: 'watch',
      video_title: title,
      video_id: videoId ?? ''
    }

    // Initialize player
    const player = videojs(videoRef.current, {
      ...defaultVideoJsOptions,
      autoplay: true,
      controls: false,
      loop: !isPreview && !currentMuxInsert, // Don't loop Mux inserts
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
      // Immediately hide native subtitles to prevent flash before custom overlay renders
      const textTracks = player.textTracks?.()
      if (textTracks != null) {
        for (let i = 0; i < textTracks.length; i++) {
          const track = textTracks[i]
          if (track.kind === 'subtitles') {
            track.mode = 'disabled'
          }
        }
      }

      // Also hide via CSS class as additional safeguard
      const element = player.el() as HTMLElement | null
      if (element != null) {
        element.classList.add('hero-hide-native-subtitles')
      }

      setPlayerReady(true)
      if (
        shouldRestoreVolumeRef.current &&
        originalVolumeRef.current != null &&
        !player.muted()
      ) {
        player.volume(originalVolumeRef.current)
      }
      shouldRestoreVolumeRef.current = false
    })

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose()
        playerRef.current = null
      }
      setPlayerReady(false)
    }
  }, [currentMuxInsert?.id, variant?.hls, title, variant?.id, currentMuxInsert, isPreview])

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
      onMuxInsertComplete?.()
    }, currentMuxInsert.duration * 1000) // Convert seconds to milliseconds

    return () => {
      clearTimeout(timer)
    }
  }, [
    currentMuxInsert?.duration,
    currentMuxInsert?.id,
    playerReady,
    onMuxInsertComplete
  ])

  useEffect(() => {
    if (!playerReady || playerRef.current == null) return

    const player = playerRef.current

    const handlePlaying = () => {
      clearFadeTimers()
      setIsFadingOut(false)
      if (
        shouldRestoreVolumeRef.current &&
        originalVolumeRef.current != null &&
        !player.muted()
      ) {
        player.volume(originalVolumeRef.current)
      }
      shouldRestoreVolumeRef.current = false
    }

    player.on('playing', handlePlaying)

    return () => {
      player.off('playing', handlePlaying)
    }
  }, [playerReady, clearFadeTimers])

  useEffect(() => {
    if (!playerReady || playerRef.current == null) return

    const player = playerRef.current

    const triggerFadeWhenEnding = () => {
      const duration = player.duration()
      const currentTime = player.currentTime()
      if (
        Number.isFinite(duration) &&
        duration > 0 &&
        Number.isFinite(currentTime) &&
        duration - currentTime <= 1.5
      ) {
        startFadeOut()
      }
    }

    player.on('timeupdate', triggerFadeWhenEnding)
    player.on('ended', startFadeOut)

    return () => {
      player.off('timeupdate', triggerFadeWhenEnding)
      player.off('ended', startFadeOut)
    }
  }, [playerReady, startFadeOut])

  useEffect(() => {
    if (progress >= 95 && playerRef.current != null) {
      startFadeOut()
    }
  }, [progress, startFadeOut])

  useEffect(() => {
    if (!playerReady || playerRef.current == null) return
    if (!currentMuxInsert?.duration) return

    if (currentMuxInsert.duration <= 1.2) return

    const msUntilFade = currentMuxInsert.duration * 1000 - 1200
    if (msUntilFade <= 0) return

    muxInsertFadeTimeoutRef.current = setTimeout(() => {
      startFadeOut()
    }, msUntilFade)

    return () => {
      if (muxInsertFadeTimeoutRef.current != null) {
        clearTimeout(muxInsertFadeTimeoutRef.current)
        muxInsertFadeTimeoutRef.current = null
      }
    }
  }, [currentMuxInsert?.duration, playerReady, startFadeOut])

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
    effectiveSubtitleLanguageId,
    subtitleOn,
    variant,
    mute,
    subtitleUpdate,
    playerReady
  ])

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
              'vjs [&_.vjs-tech]:object-contain [&_.vjs-tech]:md:object-cover hero-hide-native-subtitles',
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
          className={clsx(
            'absolute inset-0 z-[2] pointer-events-none bg-black transition-opacity duration-700 ease-out',
            isFadingOut ? 'opacity-80' : 'opacity-0'
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
              onSkip={onSkip}
            />
          </>
        )}
        <MuxInsertLogoOverlay variantId={currentMuxInsert ? `${currentMuxInsert.id}-variant` : variant?.id} />
      </>
    </div>
  )
}
