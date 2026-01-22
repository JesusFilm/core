import clsx from 'clsx'
import last from 'lodash/last'
import { ReactElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'

import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { MuxMetadata } from '@core/shared/ui/muxMetadataType'

import { useFullscreen } from '../../libs/hooks/useFullscreen'
import { usePlayer } from '../../libs/playerContext/PlayerContext'
import { useVideo } from '../../libs/videoContext/VideoContext'
import { useWatch } from '../../libs/watchContext'
import { useSubtitleUpdate } from '../../libs/watchContext/useSubtitleUpdate'
import type { CarouselMuxSlide } from '../../types/inserts'

import { HeroSubtitleOverlay } from './HeroSubtitleOverlay'
import { MuxInsertLogoOverlay } from './MuxInsertLogoOverlay'
import { VideoControls } from './VideoControls'

import 'video.js/dist/video-js.css'
import 'videojs-mux'

interface VideoBlockProps {
  placement?: 'carouselItem' | 'singleVideo'
  currentMuxInsert?: CarouselMuxSlide | null
  onMuxInsertComplete?: () => void
  onSkipActiveVideo?: () => void
}

function playWithAbortProtection(player?: Player | null): void {
  if (player == null) return

  const playResult = player.play()
  if (playResult != null && typeof playResult.catch === 'function') {
    playResult.catch((error: DOMException) => {
      if (error?.name === 'AbortError') return

      if (process.env.NODE_ENV !== 'production') {
        console.error('Video playback failed', error)
      }
    })
  }
}

function disposePlayer(player: Player): void {
  try {
    // Pause the video to stop any ongoing loading
    if (!player.paused()) {
      player.pause()
    }

    // Reset the source to stop any network requests
    player.src('')

    // Small delay to allow abort events to fire
    // Note: This is async but we're not awaiting in the calling context
  } catch {
    // Continue if cleanup fails
  }

  try {
    player.dispose()
  } catch {
    // Continue if disposal fails
  }
}

/**
 * VideoBlock component that handles video playback with smooth transitions.
 *
 * Key optimizations for video switching:
 * - Video element stays mounted in DOM (no React key) to prevent video.js conflicts
 * - Dynamic source updates instead of player recreation for smooth transitions
 * - Proper DOM readiness checks before video.js initialization
 */
export function VideoBlock({
  placement = 'singleVideo',
  currentMuxInsert,
  onMuxInsertComplete,
  onSkipActiveVideo
}: VideoBlockProps): ReactElement {
  const { variant, ...video } = useVideo()
  const {
    state: { mute, play },
    dispatch: dispatchPlayer
  } = usePlayer()
  const {
    state: { subtitleLanguageId, subtitleOn }
  } = useWatch()
  const isFullscreen = useFullscreen()
  const [collapsed, setCollapsed] = useState(mute)
  const [wasUnmuted, setWasUnmuted] = useState(false)
  const [playerReady, setPlayerReady] = useState(false)
  const [mediaError, setMediaError] = useState<Error | null>(null)
  const [videoElementReady, setVideoElementReady] = useState(false)
  const [aspectRatioClass, setAspectRatioClass] = useState<string>('')

  const videoRef = useRef<HTMLVideoElement>(null)

  // Use Mux insert title if available, otherwise use regular video title
  const title = currentMuxInsert
    ? currentMuxInsert.overlay.title
    : (last(video.title)?.value ?? '')
  const playerRef = useRef<
    (Player & { textTracks?: () => TextTrackList }) | null
  >(null)

  // Sync collapsed state with mute state
  useEffect(() => {
    setCollapsed(mute)
  }, [mute])

  const handleMuteToggle = useCallback(
    (isMuted: boolean): void => {
      setCollapsed(isMuted)
      // Track if video was unmuted at least once on single page
      if (placement === 'singleVideo' && !isMuted) {
        setWasUnmuted(true)
      }
    },
    [placement]
  )

  const pauseVideoOnScrollAway = useCallback((): void => {
    const scrollY = window.scrollY
    if (playerRef.current) {
      if (scrollY > 600) {
        playerRef.current.pause()
      } else if (scrollY === 0) {
        playWithAbortProtection(playerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', pauseVideoOnScrollAway, { passive: true })
    return () => window.removeEventListener('scroll', pauseVideoOnScrollAway)
  }, [pauseVideoOnScrollAway])

  // Hide native subtitles when video element is available
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
    const handleLoadedMetadata = () => {
      hideNativeSubtitles()

      // Detect aspect ratio and set appropriate class
      if (videoElement.videoWidth && videoElement.videoHeight) {
        const ratio = videoElement.videoWidth / videoElement.videoHeight
        let aspectClass = ''

        console.log('🎬 Video aspect ratio debug:', {
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight,
          calculatedRatio: ratio,
          ratioFormatted: `${videoElement.videoWidth}:${videoElement.videoHeight}`
        })

        // Specific aspect ratios with some tolerance - using Tailwind-compatible classes
        if (Math.abs(ratio - 4/3) < 0.1) {
          aspectClass = 'aspect-[4/3]' // Tailwind arbitrary value for 4:3
        } else if (Math.abs(ratio - 21/9) < 0.1) {
          aspectClass = 'aspect-[21/9]' // Tailwind arbitrary value for ultrawide
        } else if (Math.abs(ratio - 1/1) < 0.1) {
          aspectClass = 'aspect-square' // Tailwind's square aspect ratio
        } else {
          // Fallback to aspect-video for all other ratios (including 16:9 and custom ratios)
          aspectClass = 'aspect-video'
        }

        console.log('🎯 Applied Tailwind aspect ratio class (aspect-video is fallback):', aspectClass)
        setAspectRatioClass(aspectClass)
      }
    }
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

  // Track when video element is mounted in DOM
  useLayoutEffect(() => {
    setVideoElementReady(!!(videoRef.current && videoRef.current.parentNode))
  }, [videoRef.current])

  // Initialize video.js player when element is ready or placement changes
  useEffect(() => {
    const setupPlayer = async () => {
      // Determine the video source and ID based on current content
      const videoSource = currentMuxInsert
        ? currentMuxInsert.urls.hls
        : variant?.hls
      const videoId = currentMuxInsert ? currentMuxInsert.id : variant?.id

      if (!videoElementReady || !videoRef.current) {
        return
      }

      // If we have a player and the video source changed, just update the source
      if (playerRef.current && playerReady && videoSource) {
        const currentSrc = playerRef.current.currentSrc()
        const newSrc = videoSource

        // Only update if the source actually changed
        if (currentSrc !== newSrc) {
          try {
            // Pause current video before changing source
            if (!playerRef.current.paused()) {
              playerRef.current.pause()
            }

            // Update the source
            playerRef.current.src({
              src: newSrc,
              type: 'application/x-mpegURL'
            })

            // Clear any previous errors when setting up new video
            setMediaError(null)
          } catch (error) {
            console.error('Failed to update video source:', error)
            setMediaError(new Error('Failed to load video'))
          }
        }
        return
      }

      // If no video source, dispose existing player
      if (!videoSource) {
        if (playerRef.current) {
          try {
            playerRef.current.dispose()
          } catch {
            // Continue if disposal fails
          }
          playerRef.current = null
          setPlayerReady(false)
        }
        return
      }

      // Dispose of existing player before creating new one (only when necessary)
      if (playerRef.current) {
        disposePlayer(playerRef.current)
        playerRef.current = null
        setPlayerReady(false)

        // Small delay to allow disposal to complete
        await new Promise((resolve) => setTimeout(resolve, 50))
      }

      // Create Mux metadata for video analytics
      const muxMetadata: MuxMetadata = {
        env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
        player_name: 'watch',
        video_title: title,
        video_id: videoId ?? ''
      }

      // Ensure video element is still valid before initializing
      if (!videoRef.current || !videoRef.current.parentNode) {
        return
      }

      // Initialize player
      let player: Player
      try {
        player = videojs(videoRef.current, {
          ...defaultVideoJsOptions,
          autoplay: true,
          controls: false,
          loop: placement == 'singleVideo' && !currentMuxInsert, // Don't loop Mux inserts
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
      } catch (error) {
        console.error('Failed to initialize videojs player:', error)
        setMediaError(new Error('Failed to initialize video player'))
        return
      }

      playerRef.current = player

      player.src({
        src: videoSource,
        type: 'application/x-mpegURL'
      })

      player.ready(() => {
        // Immediately hide native subtitles to prevent flash before custom overlay renders
        const textTracks = (
          player as Player & { textTracks?: () => TextTrackList }
        ).textTracks?.()
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
          const mediaError = new Error(
            `Video loading failed: ${playerError.message}`
          )
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
          } catch {
            // Error during player disposal
          }
          playerRef.current = null
        }
        setPlayerReady(false)
      }
    }

    // Execute the async setup
    void setupPlayer()
  }, [
    placement,
    videoElementReady
  ])

  // Handle video source changes dynamically without recreating the player
  // This allows smooth transitions between videos without player reinitialization
  useEffect(() => {
    const videoSource = currentMuxInsert
      ? currentMuxInsert.urls.hls
      : variant?.hls

    // Clear aspect ratio class when switching videos
    // setAspectRatioClass('')

    if (!playerRef.current || !playerReady || !videoSource) {
      return
    }

    const currentSrc = playerRef.current.currentSrc()

    // Only update if the source actually changed
    if (currentSrc !== videoSource) {
      try {
        // Pause current video before changing source
        if (!playerRef.current.paused()) {
          playerRef.current.pause()
        }

        // Update the source
        playerRef.current.src({
          src: videoSource,
          type: 'application/x-mpegURL'
        })

        // Update Mux metadata for analytics
        const videoId = currentMuxInsert ? currentMuxInsert.id : variant?.id
        const newTitle = currentMuxInsert
          ? currentMuxInsert.overlay.title
          : (last(video.title)?.value ?? '')

        // Note: We can't easily update Mux metadata on existing players
        // The metadata is set during player creation

        // Clear any previous errors
        setMediaError(null)
      } catch (error) {
        console.error('Failed to update video source:', error)
        setMediaError(new Error('Failed to load video'))
      }
    }
  }, [currentMuxInsert, variant, playerReady])

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
        playWithAbortProtection(playerRef.current)
      } else if (!play && isCurrentlyPlaying) {
        playerRef.current.pause()
      }
    }
  }, [play, playerReady])

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

  const { subtitleUpdate } = useSubtitleUpdate()

  const effectiveSubtitleLanguageId =
    subtitleLanguageId ?? variant?.language.id ?? null

  const handlePreviewClick = useCallback(
    (e: React.MouseEvent<HTMLVideoElement>) => {
      e.stopPropagation()
      const newMuteState = !mute
      playerRef.current?.muted(newMuteState)
      dispatchPlayer({ type: 'SetMute', mute: newMuteState })
      handleMuteToggle?.(newMuteState)
    },
    [mute, dispatchPlayer, handleMuteToggle]
  )

  // Clear subtitle tracks when video source changes
  useEffect(() => {
    if (!playerRef.current || !playerReady) return

    const tracks = playerRef.current.textTracks?.() ?? []
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]
      if (track.kind === 'subtitles') {
        track.mode = 'disabled'
        // Remove the track to prevent it from interfering with new subtitles
        try {
          playerRef.current.removeRemoteTextTrack(track)
        } catch {
          // Continue if removal fails
        }
      }
    }
  }, [currentMuxInsert?.id, variant?.id, playerReady])

  useEffect(() => {
    const player = playerRef.current
    if (player == null || !playerReady) return

    void subtitleUpdate({
      player,
      subtitleLanguageId: effectiveSubtitleLanguageId,
      subtitleOn: mute || subtitleOn
    })
  }, [
    effectiveSubtitleLanguageId,
    subtitleOn,
    mute,
    subtitleUpdate,
    playerReady,
    // Include video source dependencies to trigger subtitle update when video changes
    currentMuxInsert?.id,
    variant?.id
  ])

  const shouldShowOverlay =
    playerReady &&
    (mute || (subtitleOn ?? false)) &&
    !(placement === 'singleVideo' && wasUnmuted)

  return (
    <div
      className={clsx(
        'relative z-[1] flex w-full max-h-[100vh] items-end overflow-hidden bg-[#000] transition-all duration-300 ease-out',
        isFullscreen ? 'h-[100vh]' : aspectRatioClass,
        {
          'aspect-[var(--ratio-sm)] md:aspect-[var(--ratio-md)]':
            placement == 'carouselItem' && collapsed,
          // 'aspect-[var(--ratio-sm-expanded)] md:aspect-[var(--ratio-md-expanded)]':
          //   placement == 'singleVideo' || !collapsed
        }
      )}

      // 'relative z-[1] h-screen max-h-[100vh] flex w-full items-end overflow-hidden bg-[#000] transition-all duration-300 ease-out',
        
      data-testid="ContentHero"
    >
      <>
        <div
          className={clsx(
            "vjs-hide-loading-spinners fixed top-0 right-0 left-0 z-0 max-w-[100vw] max-h-[100vh] mx-auto [body[style*='padding-right']_&]:right-[15px]",
            isFullscreen ? 'h-full' : aspectRatioClass,
            {
              'aspect-[var(--ratio-sm)] md:aspect-[var(--ratio-md)]':
                placement == 'carouselItem' && collapsed,
              // 'aspect-[var(--ratio-sm-expanded)] max-w-[100vw] max-h-[100vh] md:aspect-[var(--ratio-md-expanded)]':
              //   placement != 'singleVideo' && !collapsed,
              'video-height-unmuted': placement === 'singleVideo' ? wasUnmuted : !collapsed,
              'video-height-muted': placement === 'singleVideo' ? !wasUnmuted : collapsed,
              'video-placement-single': placement === 'singleVideo',
              'video-placement-carousel': placement === 'carouselItem'
            }
          )}
          data-testid="VideoBlockPlayerContainer"
        >
          <>
            {/* Video element without React key to prevent remounting during source changes */}
            <video
              data-testid="VideoBlockPlayer"
              ref={videoRef}
              className={clsx(
                'vjs hero-hide-native-subtitles max-h-[100vh] max-w-[100vw]',
                {
                  // 
                  'object-cover': !isFullscreen && collapsed,
                  'object-contain': isFullscreen || !collapsed,
                  'cursor-pointer': placement == 'carouselItem'
                }
              )}
              style={{
                // Show video when we have a source, hide when we don't (but keep element in DOM)
                display: (currentMuxInsert?.urls.hls || variant?.hls) ? 'block' : 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%'
              }}
              playsInline
              onClick={
                placement == 'carouselItem' ? handlePreviewClick : undefined
              }
            />

            {/* Error display for media loading failures */}
            {mediaError && (
              <div
                className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black p-4 text-center text-white"
                data-testid="VideoBlockPlayerError"
              >
                <div>
                  {/* eslint-disable-next-line i18next/no-literal-string */}
                  <div className="mb-2 text-lg font-semibold">Video Error</div>
                  <div className="text-sm opacity-90">{mediaError.message}</div>
                  {process.env.NODE_ENV === 'development' &&
                    'code' in mediaError &&
                    typeof mediaError.code === 'number' &&
                    'videoId' in mediaError &&
                    typeof mediaError.videoId === 'string' && (
                      <div className="mt-2 text-xs opacity-75">
                        {`Code: ${mediaError.code} | Video ID: ${mediaError.videoId}`}
                      </div>
                    )}
                </div>
              </div>
            )}
            <div
              className={`pointer-events-none absolute inset-0 z-1 transition-opacity duration-300 ${
                collapsed && !(placement === 'singleVideo' && wasUnmuted)
                  ? 'opacity-70'
                  : 'opacity-0'
              }`}
              style={{
                backdropFilter: 'brightness(.4) saturate(.6) sepia(.4)',
                backgroundImage: 'url(/assets/overlay.svg)',
                backgroundSize: '1600px auto'
              }}
            />
            {/* Subtitles */}
            <HeroSubtitleOverlay
              player={playerRef.current}
              subtitleLanguageId={effectiveSubtitleLanguageId}
              visible={shouldShowOverlay}
            />

            <MuxInsertLogoOverlay
              variantId={
                currentMuxInsert ? `${currentMuxInsert.id}-variant` : variant?.id
              }
            />
          </>
        </div>
        {playerRef.current != null && playerReady && (
          <>
            <VideoControls
              player={playerRef.current}
              isPreview={placement == 'carouselItem'}
              onMuteToggle={handleMuteToggle}
              customDuration={currentMuxInsert?.duration}
              action={currentMuxInsert?.overlay.action}
              isMuxInsert={currentMuxInsert != null}
              muxOverlay={currentMuxInsert?.overlay}
              onSkip={onSkipActiveVideo}
              placement={placement}
              wasUnmuted={wasUnmuted}
            />
          </>
        )}
      </>
    </div>
  )
}
