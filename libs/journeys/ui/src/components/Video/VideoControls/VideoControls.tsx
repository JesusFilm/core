import FullscreenExitRounded from '@mui/icons-material/FullscreenExitRounded'
import FullscreenRounded from '@mui/icons-material/FullscreenRounded'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeDownOutlined from '@mui/icons-material/VolumeDownOutlined'
import VolumeMuteOutlined from '@mui/icons-material/VolumeMuteOutlined'
import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import fscreen from 'fscreen'
import { MouseEventHandler, ReactElement, useEffect, useState } from 'react'
import Player from 'video.js/dist/types/player'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { useBlocks } from '../../../libs/block'

interface VideoControlProps {
  player: Player
  startAt: number
  endAt: number
  isYoutube?: boolean
  loading?: boolean
  autoplay?: boolean
  muted?: boolean
}

function isIOS(): boolean {
  const userAgent = navigator.userAgent
  return /iPad|iPhone|Macintosh|iPod/.test(userAgent)
}

export function VideoControls({
  player,
  startAt,
  endAt,
  isYoutube = false,
  loading = false,
  autoplay = false,
  muted: mute = false
}: VideoControlProps): ReactElement {
  const [playing, setPlaying] = useState(false)
  const [active, setActive] = useState(true)
  const [displayTime, setDisplayTime] = useState('0:00')
  const [progress, setProgress] = useState(0)
  const initialVolume = player.volume() ?? 0
  const [volume, setVolume] = useState(initialVolume * 100)
  // Explicit muted state since player.muted state lags when video paused
  const [muted, setMuted] = useState(mute)
  // Explicit fullscreen state since player.fullscreen state lags when video paused
  const [fullscreen, setFullscreen] = useState(
    (fscreen.fullscreenElement != null || player.isFullscreen()) ?? false
  )
  const {
    showHeaderFooter,
    setShowHeaderFooter,
    showNavigation,
    setShowNavigation
  } = useBlocks()

  // EndAt could be 0 if player not yet initialised
  const durationSeconds = endAt - startAt
  const duration =
    durationSeconds < 0
      ? null
      : secondsToTimeFormat(durationSeconds, { trimZeroes: true })

  const visible = !playing || active || loading

  // Hide navigation when invisible, show navigation when paused or active
  useEffect(() => {
    if (showNavigation && !visible) {
      setShowNavigation(false)
    }
  }, [showNavigation, setShowNavigation, visible])

  // Handle play event
  useEffect(() => {
    const handleVideoPlay = (): void => {
      // Always mute first video
      if (player.muted() ?? false) {
        setMuted(true)
      }
      setPlaying(true)
      const currentTime = player.currentTime() ?? 0
      if (startAt > 0 && currentTime < startAt) {
        setProgress(startAt)
      }
      if (isYoutube) {
        if (player.hasStarted_) {
          setShowHeaderFooter(!fullscreen)
        } else {
          setShowHeaderFooter(false)
          setTimeout(() => setShowHeaderFooter(!fullscreen), 3500)
        }
      }
    }
    player.on('play', handleVideoPlay)
    return () => {
      player.off('play', handleVideoPlay)
    }
  }, [player, isYoutube, fullscreen, startAt, setShowHeaderFooter])

  // Handle pause event
  useEffect(() => {
    const handleVideoPause = (): void => {
      setPlaying(false)

      const isUserActive = player.userActive() ?? false
      const videoHasClashingUI = isYoutube && isUserActive
      if (videoHasClashingUI) {
        setShowHeaderFooter(false)
      }
    }
    player.on('pause', handleVideoPause)
    return () => {
      player.off('pause', handleVideoPause)
    }
  }, [player, isYoutube, setShowHeaderFooter])

  // Handle time update event
  useEffect(() => {
    // Recalculate for startAt/endAt snippet
    const handleVideoTimeChange = (): void => {
      const currentTime = player.currentTime() ?? 0
      if (endAt > 0 && currentTime > endAt) {
        // 1) Trigger pause, we get an error if trying to update time here
        player.pause()
      }
      if (currentTime >= startAt) {
        setDisplayTime(
          secondsToTimeFormat(currentTime - startAt, {
            trimZeroes: true
          })
        )
      }
      setProgress(currentTime)
    }
    player.on('timeupdate', handleVideoTimeChange)
    return () => {
      player.off('timeupdate', handleVideoTimeChange)
    }
  }, [player, startAt, endAt])

  // Handle user active event
  useEffect(() => {
    // Triggers when video is playing / controls faded and screen is clicked
    const handleUserActive = (): void => {
      setShowNavigation(true)
      setActive(true)
    }
    const handleUserInactive = (): void => setActive(false)

    player.on('useractive', handleUserActive)
    player.on('userinactive', handleUserInactive)
    return () => {
      player.off('useractive', handleUserActive)
      player.off('userinactive', handleUserInactive)
    }
  }, [player, setShowNavigation])

  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      const fullscreen =
        fscreen.fullscreenElement != null || (player.isFullscreen() ?? false)
      setFullscreen(fullscreen)

      const isUserActive = player.userActive() ?? false
      const videoHasClashingUI = isYoutube && !playing && isUserActive
      if (videoHasClashingUI) {
        setShowHeaderFooter(false)
      } else {
        setShowHeaderFooter(!fullscreen)
      }
    }

    if (fscreen.fullscreenEnabled) {
      fscreen.addEventListener('fullscreenchange', handleFullscreenChange)
    } else {
      player.on('fullscreenchange', handleFullscreenChange)
    }
    return () => {
      if (fscreen.fullscreenEnabled) {
        fscreen.removeEventListener('fullscreenchange', handleFullscreenChange)
      } else {
        player.off('fullscreenchange', handleFullscreenChange)
      }
    }
  }, [player, isYoutube, playing, setShowHeaderFooter, setShowNavigation])

  function handlePlay(): void {
    if (!playing) {
      void player.play()
      // Youtube breaks when this is gone
      setPlaying(true)
    } else {
      void player.pause()
      setPlaying(false)
      setShowNavigation(true)
    }
  }

  function handleFullscreen(): void {
    if (fullscreen) {
      if (fscreen.fullscreenEnabled) {
        void fscreen.exitFullscreen()
      } else {
        void player.exitFullscreen()
      }
    } else {
      if (fscreen.fullscreenEnabled) {
        const activeCard = document.querySelectorAll(
          '.swiper-slide-active .MuiPaper-root'
        )[0]
        if (activeCard != null) {
          void fscreen.requestFullscreen(activeCard)
        }
      } else {
        void player.requestFullscreen()
      }
    }
  }

  function handleSeek(e: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      setProgress(value)
      player.currentTime(value)
    }
  }

  function handleMute(): void {
    setMuted(!muted)
    player.muted(!muted)
  }

  function handleVolume(e: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      player.muted(false)
      setMuted(false)
      setVolume(value)
      player.volume(value / 100)
    }
  }

  function getClickHandler(
    onClick: MouseEventHandler,
    onDblClick: MouseEventHandler,
    delay = 250
  ): MouseEventHandler {
    let timeoutID: NodeJS.Timeout | undefined
    return function (event) {
      event.stopPropagation()
      if (timeoutID == null) {
        timeoutID = setTimeout(function () {
          onClick(event)
          timeoutID = undefined
        }, delay)
      } else {
        clearTimeout(timeoutID)
        timeoutID = undefined
        onDblClick(event)
      }
    }
  }

  return (
    <Box
      aria-label="video-controls"
      role="region"
      dir="ltr"
      sx={{
        position: 'absolute',
        zIndex: 1000,
        top: 0,
        right: 0,
        bottom: { xs: 0, lg: 4 },
        left: 0,
        cursor: visible ? undefined : 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
      onClick={getClickHandler(handlePlay, handleFullscreen)}
      onMouseMove={() => player.userActive(true)}
      onTouchEnd={(e) => {
        const target = e.target as Element
        const isUserActive = player.userActive() ?? false
        const controlsHidden = !isUserActive
        const videoControlsNotClicked =
          !target.classList.contains('MuiSlider-root') &&
          !target.classList.contains('MuiSlider-rail') &&
          !target.classList.contains('MuiSlider-track') &&
          !target.classList.contains('MuiSvgIcon-root') &&
          target.nodeName !== 'path'
        // iOS: pause video on first click, default just shows controls.
        if (controlsHidden && videoControlsNotClicked && isIOS()) {
          void player.pause()
          setPlaying(false)
        }
        player.userActive(true)
      }}
      data-testid="JourneysVideoControls"
    >
      <Fade
        in={visible}
        style={{ transitionDuration: '500ms' }}
        timeout={{ exit: 3000 }}
      >
        <Stack justifyContent="flex-end" sx={{ height: '100%' }}>
          {/* Mute / Unmute */}
          <Stack
            flexDirection="row"
            justifyContent="flex-end"
            sx={{ mt: 15, display: { lg: 'none' } }}
          >
            <IconButton
              aria-label="mute"
              sx={{
                mx: 4,
                mt: 1,
                backgroundColor: '#ffffff29',
                ':hover': {
                  background: '#ffffff3d'
                }
              }}
              onClick={handleMute}
            >
              {muted ? <VolumeOffOutlined /> : <VolumeUpOutlined />}
            </IconButton>
          </Stack>
          {/* Play/Pause */}
          <Stack flexGrow={1} alignItems="center" justifyContent="center">
            {!loading ? (
              <IconButton
                aria-label={
                  playing ? 'center-pause-button' : 'center-play-button'
                }
                sx={{
                  fontSize: 50,
                  display: { xs: 'flex', lg: 'none' },
                  p: { xs: 2, sm: 0, md: 2 }
                }}
              >
                {playing ? (
                  <PauseRounded fontSize="inherit" />
                ) : (
                  <PlayArrowRounded fontSize="inherit" />
                )}
              </IconButton>
            ) : (
              <CircularProgress size={65} />
            )}
          </Stack>
          {/* Progress Bar */}
          <Container
            className="swiper-no-swiping"
            data-testid="vjs-jfp-custom-controls"
            maxWidth="xxl"
            sx={{
              zIndex: 1,
              transitionDelay: visible ? undefined : '0.5s',
              pb: {
                xs: showHeaderFooter || isYoutube ? 28 : 2,
                sm: showHeaderFooter || isYoutube ? 15 : 2,
                lg: 2
              }
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Stack
              direction="row"
              gap={5}
              justifyContent={{ xs: 'space-between', lg: 'none' }}
              alignItems="center"
            >
              <IconButton
                aria-label={playing ? 'bar-pause-button' : 'bar-play-button'}
                onClick={handlePlay}
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  ml: { xs: 0, lg: -1 }
                }}
              >
                {!playing ? <PlayArrowRounded /> : <PauseRounded />}
              </IconButton>
              <Slider
                aria-label="desktop-progress-control"
                min={startAt}
                max={endAt - 0.25}
                value={progress}
                valueLabelFormat={displayTime}
                valueLabelDisplay="auto"
                onChange={handleSeek}
                sx={{
                  height: 8,
                  display: { xs: 'none', lg: 'flex' },
                  '& .MuiSlider-thumb': {
                    width: 13,
                    height: 13,
                    mr: -3
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'secondary.main'
                  },
                  '& .MuiSlider-track': {
                    border: 'none'
                  }
                }}
              />
              {player != null && duration != null && (
                <Typography
                  variant="caption"
                  color="secondary.main"
                  noWrap
                  overflow="unset"
                  sx={{ p: 2 }}
                >
                  {displayTime} / {duration}
                </Typography>
              )}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-end"
                sx={{ width: { xs: '100%', lg: 'unset' }, p: 1.5 }}
              >
                <Stack
                  alignItems="center"
                  spacing={2}
                  direction="row"
                  sx={{
                    display: { xs: 'none', lg: 'flex' },
                    '> .MuiSlider-root': {
                      width: 0,
                      opacity: 0,
                      transition: 'all 0.2s ease-out'
                    },
                    '&:hover': {
                      '> .MuiSlider-root': {
                        width: 70,
                        mx: 3,
                        opacity: 1
                      }
                    }
                  }}
                >
                  <IconButton onClick={handleMute} sx={{ p: 0 }}>
                    {(player.muted() ?? false) || volume === 0 ? (
                      <VolumeOffOutlined />
                    ) : volume > 60 ? (
                      <VolumeUpOutlined />
                    ) : volume > 30 ? (
                      <VolumeDownOutlined />
                    ) : (
                      <VolumeMuteOutlined />
                    )}
                  </IconButton>
                  <Slider
                    aria-label="volume-control"
                    min={0}
                    max={100}
                    value={player.muted() ?? false ? 0 : volume}
                    valueLabelFormat={(value) => {
                      return `${Math.round(value)}%`
                    }}
                    valueLabelDisplay="auto"
                    onChange={handleVolume}
                    sx={{
                      '& .MuiSlider-thumb': {
                        width: 10,
                        height: 10,
                        mr: -3
                      },
                      '& .MuiSlider-rail': {
                        backgroundColor: 'secondary.main'
                      }
                    }}
                  />
                </Stack>
                <IconButton
                  aria-label="fullscreen"
                  onClick={handleFullscreen}
                  sx={{ py: 0, px: 2 }}
                >
                  {fullscreen ? (
                    <FullscreenExitRounded />
                  ) : (
                    <FullscreenRounded />
                  )}
                </IconButton>
              </Stack>
            </Stack>
            <Slider
              aria-label="mobile-progress-control"
              min={startAt}
              max={endAt - 0.25}
              value={progress}
              valueLabelFormat={displayTime}
              valueLabelDisplay="auto"
              onChange={handleSeek}
              disabled={!player.hasStarted_}
              sx={{
                width: 'initial',
                height: 5,
                mx: 2.5,
                py: 2,
                display: { xs: 'flex', lg: 'none' },
                '& .MuiSlider-thumb': {
                  width: 10,
                  height: 10,
                  mr: -3
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'secondary.main'
                },
                '& .MuiSlider-track': {
                  border: 'none'
                }
              }}
            />
          </Container>
        </Stack>
      </Fade>
    </Box>
  )
}
