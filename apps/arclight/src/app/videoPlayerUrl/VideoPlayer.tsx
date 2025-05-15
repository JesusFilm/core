'use client'
import ClosedCaptionOutlined from '@mui/icons-material/ClosedCaptionOutlined'
import FullscreenExitRounded from '@mui/icons-material/FullscreenExitRounded'
import FullscreenRounded from '@mui/icons-material/FullscreenRounded'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect, useRef, useState } from 'react'
import videojs from 'video.js'

import { MuxMetadata } from '@core/shared/ui/muxMetadataType'
import 'video.js/dist/video-js.css'

import 'videojs-mux'

interface VideoPlayerProps {
  hlsUrl: string
  videoTitle: string
  thumbnail?: string | null
  startTime?: number
  endTime?: number
  subon: boolean
  subtitles: {
    key: string
    language: string
    bcp47: string | null
    vttSrc: string | null
  }[]
}

export function VideoPlayer({
  hlsUrl,
  videoTitle,
  thumbnail,
  startTime = 0,
  endTime,
  subon,
  subtitles
}: VideoPlayerProps): JSX.Element {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const playerRef = useRef<HTMLVideoElement>(null)
  const playerInstanceRef = useRef<any>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(startTime * 1000) // Track in milliseconds
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [hoveringControls, setHoveringControls] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [captionsMenuAnchor, setCaptionsMenuAnchor] =
    useState<null | HTMLElement>(null)
  const [selectedCaption, setSelectedCaption] = useState<string>('')
  const [hasStarted, setHasStarted] = useState(false)

  const effectiveEndTime = endTime ?? Infinity

  const videoElementStyles = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'block',
    objectFit: 'contain',
    backgroundColor: 'transparent'
  } as const

  const initPlayer = (ref: typeof playerRef): void => {
    if (ref.current == null) return
    const muxMetadata: MuxMetadata = {
      env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
      player_name: 'arclight',
      video_title: videoTitle
    }

    // Apply any necessary styles to ensure video is visible
    const videoElement = ref.current
    videoElement.style.width = '100%'
    videoElement.style.height = '100%'
    videoElement.style.display = 'block'
    videoElement.style.backgroundColor = 'transparent'

    // Create a Video.js middleware to limit seeking to startTime and endTime range
    const timeRangeMiddleware = function (player: any) {
      return {
        setSource: function (
          srcObj: any,
          next: (arg0: null, arg1: any) => void
        ) {
          // Required method - passthrough
          next(null, srcObj)
        },
        setCurrentTime: function (time: number) {
          const effectiveStartTime = startTime
          const effectiveEndTime = endTime ?? player.duration()

          // If the requested time is outside our permitted range, clamp it
          if (time < effectiveStartTime) {
            return effectiveStartTime
          }
          if (time > effectiveEndTime) {
            return effectiveEndTime
          }

          // Within range, allow the seek
          return time
        }
      }
    }

    // Register the middleware
    videojs.use('*', timeRangeMiddleware)

    const vjsPlayer = videojs(
      ref.current,
      {
        enableSmoothSeeking: true,
        experimentalSvgIcons: true,
        preload: 'auto',
        autoplay: false,
        controls: true, // Use built-in controls
        fluid: true, // Make it responsive
        responsive: true,
        fill: true,
        playsinline: true, // Enable inline playback on mobile
        techOrder: ['html5'], // Ensure HTML5 tech is used first
        html5: {
          vhs: {
            limitRenditionByPlayerDimensions: false,
            useNetworkInformationApi: true,
            useDevicePixelRatio: true
          },
          hls: {
            limitRenditionByPlayerDimensions: false,
            useNetworkInformationApi: true,
            useDevicePixelRatio: true
          },
          nativeTextTracks: true
        },
        plugins: {
          mux: {
            debug: false,
            data: muxMetadata
          }
        }
      },
      function onPlayerReady() {
        // This callback runs when the player is ready

        // Fix any sizing issues
        vjsPlayer.addClass('vjs-fill')
        vjsPlayer.addClass('vjs-transparent-background')
        vjsPlayer.dimensions(
          videoElement.clientWidth,
          videoElement.clientHeight
        )

        // Remove background color from player element
        const playerEl = vjsPlayer.el()
        if (playerEl instanceof HTMLElement) {
          playerEl.style.backgroundColor = 'transparent'
        }

        // Find and remove background color from video element
        const videoEl = vjsPlayer.tech().el()
        if (videoEl instanceof HTMLElement) {
          videoEl.style.backgroundColor = 'transparent'
        }

        // Add custom CSS to display only the segment we care about in the progress bar
        const segmentStartPercent = 0
        const segmentEndPercent = endTime
          ? (endTime / vjsPlayer.duration()) * 100
          : 100

        const styleEl = document.createElement('style')
        styleEl.textContent = `
          .vjs-progress-holder .vjs-play-progress {
            background-color: #3498db;
          }
          .vjs-progress-holder:before {
            position: absolute;
            display: block;
            content: '';
            background-color: rgba(255, 255, 255, 0.3);
            width: 100%;
            height: 100%;
            border-radius: 0.3em;
          }
          .vjs-time-tooltip, .vjs-mouse-display {
            z-index: 2;
          }
        `
        document.head.appendChild(styleEl)
      }
    )

    vjsPlayer.on('loadedmetadata', () => {
      const playerDuration = vjsPlayer.duration()
      setDuration((playerDuration ?? 0) * 1000) // Convert to milliseconds

      // Set initial time to startTime
      vjsPlayer.currentTime(startTime)
    })

    vjsPlayer.on('timeupdate', () => {
      const timeInSeconds = vjsPlayer.currentTime() ?? 0
      const timeInMs = timeInSeconds * 1000 // Convert to milliseconds
      setCurrentTime(timeInMs)

      // Ensure we stay within the clip boundaries (in seconds for videojs API)
      if (timeInSeconds < startTime) {
        vjsPlayer.currentTime(startTime)
      } else if (endTime && timeInSeconds >= endTime) {
        vjsPlayer.currentTime(endTime)
        vjsPlayer.pause()
        setPlaying(false)
      }
    })

    vjsPlayer.on('play', () => {
      setPlaying(true)
      resetControlsTimeout()
      setHasStarted(true)
    })

    vjsPlayer.on('pause', () => {
      setPlaying(false)
      showControls()
    })

    vjsPlayer.on('volumechange', () => {
      const playerVolume = vjsPlayer.volume() ?? 1
      const playerMuted = vjsPlayer.muted() ?? false
      setVolume(playerVolume)
      setMuted(playerMuted)
    })

    vjsPlayer.on('error', (error: any) => {
      console.error('Video.js error:', error)
    })

    // Manually trigger the first timeupdate to set current time
    vjsPlayer.currentTime(startTime)

    // Apply styles to all video-js related elements
    setTimeout(() => {
      // Target all potentially problematic elements
      const videoJsWrapper = document.querySelector('.video-js')
      const videoElement = document.querySelector('.vjs-tech')
      const posterElement = document.querySelector('.vjs-poster')

      if (videoJsWrapper instanceof HTMLElement) {
        videoJsWrapper.style.backgroundColor = 'transparent'
      }

      if (videoElement instanceof HTMLElement) {
        videoElement.style.backgroundColor = 'transparent'
        videoElement.style.objectFit = 'contain'
        videoElement.style.opacity = '1'
      }

      if (posterElement instanceof HTMLElement) {
        posterElement.style.backgroundColor = 'transparent'
      }
    }, 100)

    // Force controls to be visible initially
    setControlsVisible(true)

    // Set the player state
    playerInstanceRef.current = vjsPlayer
  }

  // Show/hide controls based on user activity
  const showControls = () => {
    setControlsVisible(true)
    resetControlsTimeout()
  }

  const hideControls = () => {
    if (playing && !hoveringControls) {
      setControlsVisible(false)
    }
  }

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      hideControls()
    }, 3000)
  }

  // Handle various user interactions
  const handlePlayPause = () => {
    if (playerInstanceRef.current) {
      if (playing) {
        playerInstanceRef.current.pause()
      } else {
        void playerInstanceRef.current.play()
      }
    }
  }

  const handleMute = () => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.muted(!muted)
    }
  }

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    if (playerInstanceRef.current && !Array.isArray(newValue)) {
      const volumeValue = newValue / 100
      playerInstanceRef.current.volume(volumeValue)

      // Handle muting when volume is dragged to zero
      if (volumeValue <= 0) {
        playerInstanceRef.current.muted(true)
      } else if (muted) {
        playerInstanceRef.current.muted(false)
      }
    }
  }

  // Calculate progress percentage within the segment with higher precision
  const getSegmentProgress = () => {
    const startTimeMs = startTime * 1000
    const endTimeMs =
      effectiveEndTime === Infinity ? duration : effectiveEndTime * 1000

    if (currentTime < startTimeMs) return 0
    if (currentTime > endTimeMs) return 100

    const segmentDurationMs = endTimeMs - startTimeMs

    // Handle edge cases to prevent NaN, Infinity or undefined values
    if (
      !segmentDurationMs ||
      !Number.isFinite(segmentDurationMs) ||
      segmentDurationMs <= 0
    ) {
      // If duration is zero or invalid, return either 0 or 100 based on context
      return endTimeMs === Infinity ? 0 : 100
    }

    const segmentCurrentTimeMs = currentTime - startTimeMs
    // Return with higher precision to avoid jumps
    return (segmentCurrentTimeMs / segmentDurationMs) * 100
  }

  // Handle seeking with smoother movements
  const handleSeek = (_: Event, newValue: number | number[]) => {
    if (playerInstanceRef.current && !Array.isArray(newValue)) {
      // Convert from segment time to actual video time with higher precision
      const startTimeMs = startTime * 1000
      const endTimeMs =
        effectiveEndTime === Infinity ? duration : effectiveEndTime * 1000
      const segmentDurationMs = endTimeMs - startTimeMs

      // Calculate time in milliseconds first
      const seekTimeMs = startTimeMs + (newValue / 100) * segmentDurationMs
      // Convert back to seconds for the player API
      const seekTimeSeconds = seekTimeMs / 1000

      // Use requestAnimationFrame for smoother visual updates
      requestAnimationFrame(() => {
        playerInstanceRef.current.currentTime(seekTimeSeconds)
      })
    }
  }

  const handleFullscreen = () => {
    if (!playerInstanceRef.current) return

    if (fullscreen) {
      if (document.exitFullscreen) {
        void document.exitFullscreen()
      }
    } else {
      const playerElement = playerInstanceRef.current.el()
      if (playerElement.requestFullscreen) {
        void playerElement.requestFullscreen()
      }
    }
  }

  // Watch for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(document.fullscreenElement !== null)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    if (playerRef.current != null) {
      initPlayer(playerRef)

      // Remove any background colors from Video.js elements
      const videoJsElements = document.querySelectorAll('.video-js')
      videoJsElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.backgroundColor = 'transparent'
        }
      })
    }

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.dispose()
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!playerInstanceRef.current) return

      // Prevent default behavior for these keys
      switch (event.key) {
        case ' ': // Space - play/pause
        case 'k': // YouTube style - play/pause
          event.preventDefault()
          handlePlayPause()
          break
        case 'f': // fullscreen
          event.preventDefault()
          handleFullscreen()
          break
        case 'm': // mute
          event.preventDefault()
          handleMute()
          break
        case 'ArrowLeft': // back 5 seconds
          event.preventDefault()
          if (playerInstanceRef.current) {
            const newTime = Math.max(
              startTime,
              playerInstanceRef.current.currentTime() - 5
            )
            playerInstanceRef.current.currentTime(newTime)
          }
          break
        case 'ArrowRight': // forward 5 seconds
          event.preventDefault()
          if (playerInstanceRef.current) {
            const newTime = Math.min(
              effectiveEndTime,
              playerInstanceRef.current.currentTime() + 5
            )
            playerInstanceRef.current.currentTime(newTime)
          }
          break
        case 'ArrowUp': // volume up
          event.preventDefault()
          if (playerInstanceRef.current) {
            const newVolume = Math.min(
              1,
              playerInstanceRef.current.volume() + 0.1
            )
            playerInstanceRef.current.volume(newVolume)
            if (playerInstanceRef.current.muted()) {
              playerInstanceRef.current.muted(false)
            }
          }
          break
        case 'ArrowDown': // volume down
          event.preventDefault()
          if (playerInstanceRef.current) {
            const newVolume = Math.max(
              0,
              playerInstanceRef.current.volume() - 0.1
            )
            playerInstanceRef.current.volume(newVolume)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [playing, startTime, effectiveEndTime])

  // Format time for display (now handling milliseconds)
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  useEffect(() => {
    // Set default selected caption to first track if available and subon is true
    if (subon && subtitles.length > 0) {
      setSelectedCaption(subtitles[0].language)
    } else {
      setSelectedCaption('Off')
    }
  }, [subon, subtitles])

  const handleOpenCaptionsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setCaptionsMenuAnchor(event.currentTarget)
  }
  const handleCloseCaptionsMenu = () => {
    setCaptionsMenuAnchor(null)
  }
  const handleSelectCaption = (label: string) => {
    setSelectedCaption(label)
    setCaptionsMenuAnchor(null)
    // Use video.js API to update text tracks
    if (playerInstanceRef.current) {
      const tracks = playerInstanceRef.current.textTracks()
      for (let i = 0; i < tracks.length; i++) {
        if (label === 'Off') {
          tracks[i].mode = 'disabled'
        } else {
          tracks[i].mode = tracks[i].label === label ? 'showing' : 'disabled'
        }
      }
    }
  }

  return (
    <div
      className="video-player-root"
      onMouseMove={showControls}
      onClick={showControls}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        margin: 0,
        padding: 0
      }}
    >
      {/* Custom CSS to override Video.js defaults */}
      <style jsx global>{`
        .video-js,
        .vjs-poster,
        .vjs-tech,
        .vjs-big-play-button,
        .vjs-loading-spinner,
        .vjs-control-bar,
        .vjs-background-bar,
        .vjs-loaded,
        .vjs-progress-holder {
          background-color: transparent !important;
        }

        /* Ensure actual video shows through */
        .vjs-tech {
          object-fit: contain !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* Custom class for transparent background */
        .vjs-transparent-background {
          background-color: transparent !important;
        }

        /* Add visual cue for available time range in the seek bar */
        .video-js .vjs-progress-control .vjs-progress-holder {
          position: relative;
        }

        .video-js .vjs-progress-control .vjs-progress-holder::before {
          background-color: rgba(255, 255, 255, 0.3);
        }

        .video-js .vjs-play-progress {
          background-color: #3498db;
        }

        /* Ensure time tooltips are visible */
        .video-js .vjs-time-tooltip,
        .video-js .vjs-mouse-display {
          z-index: 2;
        }
      `}</style>
      {thumbnail && !hasStarted && (
        <div
          className="absolute inset-0"
          style={{
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10,
            backgroundImage: `url(${thumbnail})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'block'
          }}
        />
      )}
      <div
        data-vjs-player
        className="w-full h-full relative z-10"
        style={{
          height: '100vh',
          width: 'auto',
          maxWidth: '100vw',
          maxHeight: '100vh',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          margin: '0 auto'
        }}
      >
        <video
          className="video-js vjs-big-play-centered vjs-fluid vjs-fill"
          id="arclight-player"
          ref={playerRef}
          data-play-start={startTime ?? 0}
          data-play-end={endTime ?? 0}
          playsInline
          style={videoElementStyles}
          crossOrigin="anonymous"
        >
          <source src={hlsUrl} type="application/x-mpegURL" />
          {subtitles.map((track, idx) => (
            <track
              key={track.language + track.bcp47 + idx}
              kind="subtitles"
              src={track.vttSrc ?? ''}
              srcLang={track.bcp47 ?? undefined}
              label={track.language}
              default={subon && idx === 0}
            />
          ))}
        </video>
      </div>

      {/* Remove all custom controls since we're using Video.js built-in controls */}
    </div>
  )
}
