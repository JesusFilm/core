'use client'
import FullscreenExitRounded from '@mui/icons-material/FullscreenExitRounded'
import FullscreenRounded from '@mui/icons-material/FullscreenRounded'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { MouseEvent, useEffect, useRef, useState } from 'react'
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
}

export function VideoPlayer({
  hlsUrl,
  videoTitle,
  thumbnail,
  startTime = 0,
  endTime
}: VideoPlayerProps): JSX.Element {
  const playerRef = useRef<HTMLVideoElement>(null)
  const [player, setPlayer] = useState<any>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(startTime * 1000) // Track in milliseconds
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [hoveringControls, setHoveringControls] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const effectiveEndTime = endTime ?? Infinity

  const initPlayer = (ref: typeof playerRef): void => {
    if (ref.current == null) return
    const muxMetadata: MuxMetadata = {
      env_key: process.env.NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY || '',
      player_name: 'arclight',
      video_title: videoTitle
    }

    console.log('Initializing player...')

    const vjsPlayer = videojs(ref.current, {
      enableSmoothSeeking: true,
      experimentalSvgIcons: true,
      preload: 'none',
      controls: false, // Disable built-in controls
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
        }
      },
      plugins: {
        mux: {
          debug: false,
          data: muxMetadata
        }
      }
    })

    console.log('Player initialized, setting up event handlers...')

    vjsPlayer.on('loadedmetadata', () => {
      console.log('Metadata loaded')
      const playerDuration = vjsPlayer.duration()
      setDuration((playerDuration ?? 0) * 1000) // Convert to milliseconds
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

    // Force controls to be visible initially
    setControlsVisible(true)

    // Set the player state
    setPlayer(vjsPlayer)
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
    if (player) {
      if (playing) {
        player.pause()
      } else {
        void player.play()
      }
    }
  }

  const handleMute = () => {
    if (player) {
      player.muted(!muted)
    }
  }

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    if (player && !Array.isArray(newValue)) {
      const volumeValue = newValue / 100
      player.volume(volumeValue)

      // Handle muting when volume is dragged to zero
      if (volumeValue <= 0) {
        player.muted(true)
      } else if (muted) {
        player.muted(false)
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
    const segmentCurrentTimeMs = currentTime - startTimeMs
    // Return with higher precision to avoid jumps
    return (segmentCurrentTimeMs / segmentDurationMs) * 100
  }

  // Calculate the current position relative to the segment
  const getSegmentCurrentTime = () => {
    const startTimeMs = startTime * 1000
    const segmentCurrentTimeMs = currentTime - startTimeMs
    return Math.max(0, segmentCurrentTimeMs)
  }

  // Handle seeking with smoother movements
  const handleSeek = (_: Event, newValue: number | number[]) => {
    if (player && !Array.isArray(newValue)) {
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
        player.currentTime(seekTimeSeconds)
      })
    }
  }

  const handleFullscreen = () => {
    if (!player) return

    if (fullscreen) {
      if (document.exitFullscreen) {
        void document.exitFullscreen()
      }
    } else {
      const playerElement = player.el()
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
    }

    return () => {
      if (player) {
        player.dispose()
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!player) return

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
          if (player) {
            const newTime = Math.max(startTime, player.currentTime() - 5)
            player.currentTime(newTime)
          }
          break
        case 'ArrowRight': // forward 5 seconds
          event.preventDefault()
          if (player) {
            const newTime = Math.min(effectiveEndTime, player.currentTime() + 5)
            player.currentTime(newTime)
          }
          break
        case 'ArrowUp': // volume up
          event.preventDefault()
          if (player) {
            const newVolume = Math.min(1, player.volume() + 0.1)
            player.volume(newVolume)
            if (player.muted()) {
              player.muted(false)
            }
          }
          break
        case 'ArrowDown': // volume down
          event.preventDefault()
          if (player) {
            const newVolume = Math.max(0, player.volume() - 0.1)
            player.volume(newVolume)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [player, playing, startTime, effectiveEndTime])

  // Format time for display (now handling milliseconds)
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div
      className="relative w-full h-full"
      onMouseMove={showControls}
      onClick={showControls}
    >
      {thumbnail && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
      )}
      <video
        className="video-js vjs-fluid relative z-10"
        id="arclight-player"
        ref={playerRef}
        poster={thumbnail ?? undefined}
        data-play-start={startTime ?? 0}
        data-play-end={endTime ?? 0}
        onDoubleClick={handleFullscreen}
      >
        <source src={hlsUrl} type="application/x-mpegURL" />
      </video>

      {/* Custom Video Controls - show even if player not initialized yet */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          transition: 'opacity 0.3s ease',
          opacity: controlsVisible ? 1 : 0,
          background: playing
            ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.2) 100%)'
            : 'rgba(0, 0, 0, 0.4)',
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
              disabled={!player}
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
                disabled={!player}
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
                  disabled={!player}
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
                  disabled={!player}
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
              <Box sx={{ flex: 1, mx: 1, minWidth: 60, display: 'flex', alignItems: 'center', height: '100%' }}>
                <Slider
                  value={getSegmentProgress()}
                  onChange={handleSeek}
                  aria-label="video-progress"
                  size="small"
                  step={0.001}
                  min={0}
                  max={100}
                  disabled={!player}
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
                    minWidth: '32px'
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
                disabled={!player}
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
