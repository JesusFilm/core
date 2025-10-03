import clsx from 'clsx'
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
    state: { mute, play },
    dispatch: dispatchPlayer
  } = usePlayer()
  const {
    state: { subtitleLanguageId, subtitleOn }
  } = useWatch()
  const [playerReady, setPlayerReady] = useState(false)
  const [mediaError, setMediaError] = useState<Error | null>(null)

  // Use Mux insert title if available, otherwise use regular video title
  const title = currentMuxInsert ? currentMuxInsert.overlay.title : (last(video.title)?.value ?? '')

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<
    (Player & { textTracks?: () => TextTrackList }) | null
  >(null)

  const pauseVideoOnScrollAway = useCallback((): void => {
    const scrollY = window.scrollY
    if (playerRef.current) {
      if (scrollY > 600) {
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
    const setupPlayer = async () => {
      // Determine the video source and ID based on current content
      const videoSource = currentMuxInsert ? currentMuxInsert.urls.hls : variant?.hls
      const videoId = currentMuxInsert ? currentMuxInsert.id : variant?.id


      if (!videoRef.current || !videoSource) {
        return
      }

      // Dispose of existing player before creating new one
      if (playerRef.current) {
        // Properly pause and reset the current video before disposal to prevent abort errors
        try {
          const currentPlayer = playerRef.current

          // Pause the video to stop any ongoing loading
          if (!currentPlayer.paused()) {
            currentPlayer.pause()
          }

          // Reset the source to stop any network requests
          currentPlayer.src('')

          // Small delay to allow abort events to fire
          await new Promise(resolve => setTimeout(resolve, 50))

          // Now dispose safely
          currentPlayer.dispose()
        } catch (error) {
          // Fallback to basic disposal if proper cleanup fails
          try {
            playerRef.current.dispose()
          } catch (fallbackError) {
            // Continue if disposal fails
          }
        }

        playerRef.current = null
        setPlayerReady(false)
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
        muted: true, // Don't start unmuted, browser will not autoplay unmuted videos!
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
      })

      // Clear any previous media errors when setting up new video
      setMediaError(null)

      // Add comprehensive error event listeners to catch media loading issues
      player.on('error', (error) => {
        const playerError = player.error()
        if (playerError) {
          // Create a more user-friendly error
          const mediaError = new Error(`Video loading failed: ${playerError.message}`)
          mediaError.name = 'MediaError'
          ;(mediaError as any).code = playerError.code
          ;(mediaError as any).videoId = videoId
          setMediaError(mediaError)
        }
      })

    player.on('abort', () => {
      // Note: Abort events are normal when switching videos, so we don't set mediaError here
    })

    player.on('emptied', () => {
      // Player emptied
    })

    player.on('loadstart', () => {
      // Load started
    })

    player.on('progress', () => {
      // Progress event
    })

    player.on('loadeddata', () => {
      // Clear any previous errors once data loads successfully
      setMediaError(null)
    })

    player.on('canplay', () => {
      // Can play
    })

    player.on('canplaythrough', () => {
      // Can play through
    })

    // Handle stalled loading (network issues)
    player.on('stalled', () => {
      // Player stalled - possible network issue
    })

    // Handle waiting for data
    player.on('waiting', () => {
      // Waiting for data
    })

    // Track play/pause events that might be causing state conflicts
    player.on('play', () => {
      // Player play event
    })

    player.on('pause', () => {
      // Player pause event
    })

    player.on('playing', () => {
      // Player playing event
    })

    player.on('ended', () => {
      // Player ended event
    })

      return () => {
        if (playerRef.current) {
          try {
            playerRef.current.dispose()
          } catch (error) {
            // Error during player disposal
          }
          playerRef.current = null
        }
        setPlayerReady(false)
      }
    }

    // Execute the async setup
    setupPlayer()
  }, [currentMuxInsert?.id, variant?.hls, title, variant?.id, currentMuxInsert, isPreview])

  // Handle mute state changes dynamically without recreating the player
  useEffect(() => {
    if (playerRef.current && playerReady) {
      playerRef.current.muted(mute)
    }
  }, [mute, playerReady])

  // Handle play/pause state changes dynamically without recreating the player
  useEffect(() => {
    if (playerRef.current && playerReady) {
      const isCurrentlyPlaying = !playerRef.current.paused()

      // Only call play/pause if the player state doesn't match desired state
      if (play && !isCurrentlyPlaying) {
        void playerRef.current.play()
      } else if (!play && isCurrentlyPlaying) {
        playerRef.current.pause()
      }
    }
  }, [play, playerReady])

  useEffect(() => {
    if (playerRef.current && playerReady && !play) {
        void playerRef.current.play()
    }
  }, [playerReady])

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
  }, [currentMuxInsert?.duration, currentMuxInsert?.id, playerReady, onMuxInsertComplete])

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
    subtitleUpdate,
    playerReady
  ])

  const shouldShowOverlay = playerReady && (mute || (subtitleOn ?? false))

  return (
    <>
    <div
      className={clsx(
        "fixed top-0 left-0 right-0 mx-auto z-0 vjs-hide-loading-spinners [body[style*='padding-right']_&]:right-[15px]",
        {
          'aspect-[239/100]': isPreview && collapsed,
          'aspect-[185/100]  max-w-[1920px]': !isPreview || !collapsed
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

        {/* Error display for media loading failures */}
        {mediaError && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-center p-4"
            data-testid="ContentHeroVideoError"
          >
            <div>
              <div className="text-lg font-semibold mb-2">Video Error</div>
              <div className="text-sm opacity-90">{mediaError.message}</div>
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs opacity-75 mt-2">
                  Code: {(mediaError as any).code} | Video ID: {(mediaError as any).videoId}
                </div>
              )}
            </div>
          </div>
        )}
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
        
        <MuxInsertLogoOverlay variantId={currentMuxInsert ? `${currentMuxInsert.id}-variant` : variant?.id} />
      </>
    </div>
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
    </>
  )
}
