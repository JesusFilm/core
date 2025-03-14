import { ReactElement, useEffect, useRef, useState } from 'react'
import { Typography, IconButton, Slider } from '@mui/material'
import {
  VolumeOff,
  VolumeUp,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material'
import { gql, useQuery } from '@apollo/client'
import videojs from 'video.js'
import Player from 'video.js/dist/types/player'
import { defaultVideoJsOptions } from '@core/shared/ui/defaultVideoJsOptions'
import { useVideoMute } from '../../libs/videoMuteContext'

// Custom hook for viewport detection
const useIsInViewport = (ref: React.RefObject<HTMLElement>): boolean => {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        // Use a more Safari-friendly rootMargin
        // This creates a detection zone in the middle 50% of the screen
        rootMargin: '-25% 0px -25% 0px',
        threshold: [0, 0.1, 0.5, 1.0] // Add thresholds for more granular updates
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [ref])

  return isIntersecting
}

const GET_VIDEO_CONTENT = gql`
  query GetVideoContent($id: ID!) {
    content: video(id: $id, idType: slug) {
      id
      title {
        primary
        value
      }
      images(aspectRatio: banner) {
        mobileCinematicHigh
      }
      variant {
        id
        hls
      }
    }
  }
`

type VideoBlockProps = {
  contentId: string
  title?: string
}

export function VideoBlock({
  contentId,
  title
}: VideoBlockProps): ReactElement {
  const { pageMuted, setPageMuted } = useVideoMute()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [player, setPlayer] = useState<Player>()
  const isVisible = useIsInViewport(containerRef)
  const [isMuted, setIsMuted] = useState(pageMuted)
  const [progress, setProgress] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  const {
    data: videoData,
    loading: videoLoading,
    error: videoError
  } = useQuery(GET_VIDEO_CONTENT, {
    variables: {
      id: contentId
    }
  })

  // Handle video progress updates
  useEffect(() => {
    if (player && isPlayerReady) {
      const handleTimeUpdate = () => {
        try {
          const currentTime = player.currentTime()
          const duration = player.duration()
          if (currentTime && duration && duration > 0) {
            setProgress((currentTime / duration) * 100)
          }
        } catch (error) {
          console.warn('Failed to update progress:', error)
        }
      }

      player.on('timeupdate', handleTimeUpdate)
      return () => {
        player.off('timeupdate', handleTimeUpdate)
      }
    }
  }, [player, isPlayerReady])

  // Handle seeking
  const handleSeek = (_event: Event, newValue: number | number[]) => {
    if (player && isPlayerReady && typeof newValue === 'number') {
      try {
        const duration = player.duration()
        if (duration) {
          const newTime = (duration * newValue) / 100
          player.currentTime(newTime)
        }
      } catch (error) {
        console.warn('Failed to seek:', error)
      }
    }
  }

  // Handle fullscreen
  const handleFullscreen = () => {
    if (containerRef.current && player && isPlayerReady) {
      try {
        if (!isFullscreen) {
          if (containerRef.current.requestFullscreen) {
            containerRef.current.requestFullscreen()
            if (isMuted) {
              player.muted(false)
              setIsMuted(false)
              console.debug(
                '[VideoBlock] Unmuting on fullscreen, contentId:',
                contentId
              )
              setPageMuted(false)
            }
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen()
          }
        }
        setIsFullscreen(!isFullscreen)
      } catch (error) {
        console.warn('Failed to toggle fullscreen:', error)
      }
    }
  }

  // Handle mute toggle
  const handleMuteToggle = () => {
    if (player && isPlayerReady) {
      try {
        const newMutedState = !isMuted
        player.muted(newMutedState)
        setIsMuted(newMutedState)
        console.debug(
          '[VideoBlock] User toggled mute state:',
          newMutedState,
          'contentId:',
          contentId
        )
        setPageMuted(newMutedState)
      } catch (error) {
        console.warn('Failed to toggle mute:', error)
      }
    }
  }

  // Sync with pageMuted changes from context
  useEffect(() => {
    if (player && isPlayerReady) {
      try {
        console.debug(
          '[VideoBlock] Syncing with pageMuted state:',
          pageMuted,
          'contentId:',
          contentId
        )
        player.muted(pageMuted)
        setIsMuted(pageMuted)
      } catch (error) {
        console.warn('Failed to sync with pageMuted state:', error)
      }
    }
  }, [pageMuted, player, isPlayerReady, contentId])

  // Control video playback and mute state based on visibility
  useEffect(() => {
    if (player && isPlayerReady) {
      if (isVisible) {
        // Sync mute state with page state when becoming visible
        try {
          console.debug(
            '[VideoBlock] Video became visible, syncing mute state with pageMuted:',
            pageMuted,
            'contentId:',
            contentId
          )
          player.muted(pageMuted)
          setIsMuted(pageMuted)
        } catch (error) {
          console.warn('Failed to sync mute state:', error)
        }

        // Start playback
        void player?.play()?.catch((error) => {
          console.warn('Auto-play failed:', error)
        })

        // Smoothly scroll video to center when it becomes visible
        if (containerRef.current) {
          containerRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }
      } else {
        try {
          console.debug(
            '[VideoBlock] Video became invisible, pausing without changing mute state, contentId:',
            contentId
          )
          player.pause()
          // We don't change the mute state or call onMuteChange when a video becomes invisible
        } catch (error) {
          console.warn('Failed to pause:', error)
        }
      }
    }
  }, [isVisible, player, isPlayerReady, pageMuted, contentId])

  // Initialize player
  useEffect(() => {
    if (videoRef.current != null && videoData?.content != null) {
      console.debug(
        '[VideoBlock] Initializing player for contentId:',
        contentId
      )
      const newPlayer = videojs(videoRef.current, {
        ...defaultVideoJsOptions,
        muted: true,
        controls: false,
        controlBar: false,
        bigPlayButton: false,
        preload: 'auto',
        loop: true,
        fluid: true,
        aspectRatio: '16:9',
        poster: videoData.content.images?.[0]?.mobileCinematicHigh ?? undefined
      })

      // Wait for player to be ready
      newPlayer.ready(() => {
        console.debug('[VideoBlock] Player ready for contentId:', contentId)
        setIsPlayerReady(true)

        if (videoData.content.variant?.hls) {
          newPlayer.src({
            src: videoData.content.variant.hls,
            type: 'application/x-mpegURL'
          })
        }
      })

      setPlayer(newPlayer)

      return () => {
        console.debug('[VideoBlock] Disposing player for contentId:', contentId)
        setIsPlayerReady(false)
        if (newPlayer) {
          try {
            newPlayer.dispose()
          } catch (error) {
            console.warn('Failed to dispose player:', error)
          }
        }
      }
    }
  }, [videoData, contentId])

  return (
    <div
      className="relative mb-4 px-6 lg:px-8"
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="beveled block relative aspect-video rounded-lg overflow-hidden bg-black shadow-2xl shadow-stone-950/70">
        <div
          className="absolute top-2 right-2 z-30"
          style={{ fontSize: '24px' }}
        >
          {isVisible ? '🟢' : '🔴'}
        </div>

        {/* Video container */}
        <div className="absolute inset-0 w-full h-full">
          <video
            className="video-js vjs-fluid vjs-default-skin absolute inset-0 w-full h-full object-cover"
            ref={videoRef}
            playsInline
          />
        </div>

        {/* Fullscreen button */}
        <IconButton
          onClick={handleFullscreen}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white'
            // backgroundColor: 'rgba(0, 0, 0, 0.5)',
            // '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
            // opacity: isHovered ? 1 : 0,
            // transition: 'opacity 0.3s ease'
          }}
        >
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>

        {/* small Mute button */}
        {!isMuted && (
          <IconButton
            onClick={handleMuteToggle}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              color: 'white'
              //   backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            <VolumeUp />
          </IconButton>
        )}

        {/* Custom controls overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 z-30 py-1 px-4"
          style={{
            // opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        >
          {/* Progress bar */}
          <Slider
            value={progress}
            onChange={handleSeek}
            sx={{
              color: '#fff',
              height: 4,
              '& .MuiSlider-thumb': {
                width: 8,
                height: 8,
                transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0px 0px 0px 8px rgba(255, 0, 0, 0.16)'
                }
              },
              '& .MuiSlider-rail': {
                opacity: 0.28
              }
            }}
          />
        </div>
        {/* Large Mute button */}
        {isMuted && (
          <IconButton
            onClick={handleMuteToggle}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              //   backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '24px',
              '& .MuiSvgIcon-root': {
                fontSize: '48px'
              }
            }}
          >
            <VolumeOff />
          </IconButton>
        )}

        {/* Loading and error states */}
        {videoLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
            <Typography>Loading video...</Typography>
          </div>
        )}
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
            <Typography color="error">
              Error loading video: {videoError.message}
            </Typography>
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold mt-2 text-white">
        {title || videoData?.content?.title?.[0]?.value || 'Loading...'}
      </h3>
    </div>
  )
}
