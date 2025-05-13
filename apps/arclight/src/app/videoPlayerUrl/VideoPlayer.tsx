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
import Typography from '@mui/material/Typography'
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
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)

  const effectiveEndTime = endTime ?? Infinity

  // Wrapper styles to ensure video is visible
  const videoWrapperStyles = {
    position: 'relative',
    width: aspectRatio ? `calc(100vh * ${aspectRatio})` : '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    margin: '0 auto',
    maxWidth: '100vw',
    maxHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as const

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

    console.log('Initializing player...')

    // Apply any necessary styles to ensure video is visible
    const videoElement = ref.current
    videoElement.style.width = '100%'
    videoElement.style.height = '100%'
    videoElement.style.display = 'block'
    videoElement.style.backgroundColor = 'transparent'

    const vjsPlayer = videojs(
      ref.current,
      {
        enableSmoothSeeking: true,
        experimentalSvgIcons: true,
        preload: 'auto',
        autoplay: false,
        controls: false, // Disable built-in controls
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
        console.log('Player is ready!')

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
      }
    )

    console.log('Player initialized, setting up event handlers...')

    vjsPlayer.on('loadedmetadata', () => {
      console.log('Metadata loaded')
      const playerDuration = vjsPlayer.duration()
      setDuration((playerDuration ?? 0) * 1000) // Convert to milliseconds
      if (
        playerRef.current &&
        playerRef.current.videoWidth &&
        playerRef.current.videoHeight
      ) {
        setAspectRatio(
          playerRef.current.videoWidth / playerRef.current.videoHeight
        )
      }
    })

    vjsPlayer.on('timeupdate', () => {
      const timeInSeconds = vjsPlayer.currentTime() ?? 0
      const timeInMs = timeInSeconds * 1000 // Convert to milliseconds
      setCurrentTime(timeInMs)

      // Ensure we stay within the clip boundaries (in seconds for videojs API)
      if (timeInSeconds < startTime) {
        vjsPlayer.currentTime(startTime)
      } else if (timeInSeconds >= effectiveEndTime) {
        vjsPlayer.currentTime(effectiveEndTime)
        vjsPlayer.pause()
        setPlaying(false)
      }
    })

    vjsPlayer.on('play', () => {
      console.log('Play event')
      setPlaying(true)
      resetControlsTimeout()
    })

    vjsPlayer.on('pause', () => {
      console.log('Pause event')
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

    // Debug videojs dimensions and visibility
    console.log('Video dimensions:', {
      width: vjsPlayer.width(),
      height: vjsPlayer.height(),
      videoWidth: ref.current.videoWidth,
      videoHeight: ref.current.videoHeight,
      clientWidth: ref.current.clientWidth,
      clientHeight: ref.current.clientHeight
    })

    // Force controls to be visible initially
    setControlsVisible(true)

    // Set the player state
    playerInstanceRef.current = vjsPlayer
    console.log('Player setup complete')
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
    // Set default selected caption to first track if available
    if (subon && subtitles.length > 0) {
      setSelectedCaption(subtitles[0].language)
    } else {
      setSelectedCaption('Off')
    }
  }, [subtitles])

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
      className="relative w-full h-full"
      onMouseMove={showControls}
      onClick={showControls}
      style={{
        backgroundColor: 'transparent',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0
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
      `}</style>
      {thumbnail && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
      )}
      <div
        data-vjs-player
        className="w-full h-full relative z-10"
        style={videoWrapperStyles}
      >
        <video
          className="video-js vjs-big-play-centered vjs-fluid vjs-fill"
          id="arclight-player"
          ref={playerRef}
          poster={thumbnail ?? undefined}
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
              default={idx === 0}
            />
          ))}
        </video>
      </div>

      {/* Custom Video Controls - show even if player not initialized yet */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          transition: 'opacity 0.3s ease',
          opacity: controlsVisible ? 1 : 0,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.2) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
        onMouseEnter={() => setHoveringControls(true)}
        onMouseLeave={() => setHoveringControls(false)}
        onClick={playing ? handlePlayPause : undefined}
      >
        {/* Center Play/Pause Button */}
        {!playing && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 12
            }}
            onClick={(e) => {
              e.stopPropagation()
              handlePlayPause()
            }}
          >
            <IconButton
              aria-label="Play"
              sx={{
                color: 'white',
                padding: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.6)'
                }
              }}
              size="large"
              disabled={!playerInstanceRef.current}
            >
              <PlayArrowRounded sx={{ fontSize: 40 }} />
            </IconButton>
          </Box>
        )}

        {/* Top controls - title */}
        <Box
          sx={{
            px: 2,
            pt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
            }}
          >
            {videoTitle}
          </Typography>
        </Box>

        {/* Bottom Controls Bar */}
        <Box sx={{ px: 1.5, pb: 1.5 }}>
          {/* Progress Bar */}
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              mb: 1
            }}
          >
            {/* Slider removed from here */}
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            {/* Left side controls */}
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ flex: 1 }}
            >
              {/* Play/Pause Button */}
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlayPause()
                }}
                aria-label={playing ? 'Pause' : 'Play'}
                sx={{
                  color: 'white',
                  padding: 0.7,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
                size="small"
                disabled={!playerInstanceRef.current}
              >
                {playing ? (
                  <PauseRounded sx={{ fontSize: 20 }} />
                ) : (
                  <PlayArrowRounded sx={{ fontSize: 20 }} />
                )}
              </IconButton>

              {/* Volume Control */}
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{
                  '&:hover .volume-slider': {
                    width: 50,
                    opacity: 1,
                    ml: 0.5,
                    mr: 0.5,
                    px: 0.5
                  },
                  mr: 1.5,
                  display: 'flex',
                  alignItems: 'center'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <IconButton
                  onClick={handleMute}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                  sx={{
                    color: 'white',
                    padding: 0.7,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)'
                    }
                  }}
                  size="small"
                  disabled={!playerInstanceRef.current}
                >
                  {muted ? (
                    <VolumeOffOutlined sx={{ fontSize: 20 }} />
                  ) : (
                    <VolumeUpOutlined sx={{ fontSize: 20 }} />
                  )}
                </IconButton>
                <Slider
                  className="volume-slider"
                  value={muted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  aria-label="Volume"
                  size="small"
                  disabled={!playerInstanceRef.current}
                  sx={{
                    width: 0,
                    opacity: 0,
                    transition: 'all 0.2s ease',
                    height: 2,
                    display: 'flex',
                    alignItems: 'center',
                    my: 0,
                    '& .MuiSlider-track': {
                      border: 'none',
                      backgroundColor: '#3498db'
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'rgba(255, 255, 255, 0.3)'
                    },
                    '& .MuiSlider-thumb': {
                      width: 10,
                      height: 10,
                      backgroundColor: 'white',
                      boxShadow: 'none',
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0px 0px 0px 8px rgba(52, 152, 219, 0.16)'
                      }
                    }
                  }}
                />
              </Stack>

              {/* Seek Slider - moved here */}
              <Box
                sx={{
                  flex: 1,
                  mx: 1,
                  minWidth: 60,
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <Slider
                  value={getSegmentProgress()}
                  onChange={handleSeek}
                  aria-label="video-progress"
                  size="small"
                  step={0.001}
                  min={0}
                  max={100}
                  disabled={!playerInstanceRef.current}
                  sx={{
                    height: 4,
                    padding: 0,
                    alignSelf: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiSlider-thumb': {
                        width: 14,
                        height: 14,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      },
                      '& .MuiSlider-track': {
                        height: 5,
                        transition: 'height 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }
                    },
                    '& .MuiSlider-thumb': {
                      width: 12,
                      height: 12,
                      backgroundColor: 'white',
                      boxShadow: 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0px 0px 0px 8px rgba(52, 152, 219, 0.16)',
                        width: 14,
                        height: 14,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      },
                      '&.Mui-active': {
                        boxShadow: '0px 0px 0px 8px rgba(52, 152, 219, 0.24)',
                        width: 16,
                        height: 16,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'rgba(255, 255, 255, 0.4)',
                      opacity: 1,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '2px'
                      }
                    },
                    '& .MuiSlider-track': {
                      border: 'none',
                      backgroundColor: '#3498db',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      height: 4
                    }
                  }}
                />
              </Box>

              {/* Time Display (Duration only) */}
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                onClick={(e) => e.stopPropagation()}
                sx={{ minWidth: 40 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem',
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 400,
                    lineHeight: 1,
                    minWidth: '32px',
                    pl: 2
                  }}
                >
                  {formatTime(
                    (effectiveEndTime === Infinity
                      ? duration / 1000
                      : effectiveEndTime - startTime) * 1000
                  )}
                </Typography>
              </Stack>
            </Stack>

            {/* Right side controls */}
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Captions Selector Button */}
              <IconButton
                onClick={handleOpenCaptionsMenu}
                aria-label="Captions menu"
                tabIndex={0}
                sx={{
                  color: selectedCaption !== 'Off' ? '#3498db' : 'white',
                  padding: 0.7,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
                size="small"
                disabled={!playerInstanceRef.current}
              >
                <ClosedCaptionOutlined sx={{ fontSize: 20 }} />
              </IconButton>
              <Menu
                anchorEl={captionsMenuAnchor}
                open={Boolean(captionsMenuAnchor)}
                onClose={handleCloseCaptionsMenu}
                MenuListProps={{ 'aria-label': 'Captions menu' }}
              >
                <MenuItem
                  selected={selectedCaption === 'Off'}
                  onClick={() => handleSelectCaption('Off')}
                  aria-label="Turn captions off"
                  // eslint-disable-next-line i18next/no-literal-string
                >
                  Off
                </MenuItem>
                {subtitles.map((track) => (
                  <MenuItem
                    key={track.language}
                    selected={selectedCaption === track.language}
                    onClick={() => handleSelectCaption(track.language)}
                    aria-label={`Show captions: ${track.language}`}
                  >
                    {track.language}
                  </MenuItem>
                ))}
              </Menu>
              {/* Fullscreen Button */}
              <IconButton
                onClick={handleFullscreen}
                aria-label={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                sx={{
                  color: 'white',
                  padding: 0.7,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
                size="small"
                disabled={!playerInstanceRef.current}
              >
                {fullscreen ? (
                  <FullscreenExitRounded sx={{ fontSize: 20 }} />
                ) : (
                  <FullscreenRounded sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </div>
  )
}
