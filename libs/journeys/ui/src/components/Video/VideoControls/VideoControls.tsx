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
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import fscreen from 'fscreen'
import {
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useEffect,
  useReducer,
  useState
} from 'react'
import Player from 'video.js/dist/types/player'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { useBlocks } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'

enum PlaybackEvent {
  PLAY,
  PAUSE,
  MUTE,
  UNMUTE
}

type MobileAction = 'play' | 'pause' | 'unmute'

interface PlaybackState {
  playing: boolean
  muted: boolean
  action: MobileAction
}

interface VideoControlProps {
  player: Player
  startAt: number
  endAt: number
  isYoutube?: boolean
  loading?: boolean
  autoplay?: boolean
  muted?: boolean
  activeStep: boolean
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false

  const userAgent = navigator.userAgent
  return /iPad|iPhone|Macintosh|iPod/.test(userAgent)
}

function iPhone(): boolean {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.userAgent === 'undefined'
  )
    return false

  const userAgent = navigator.userAgent
  return userAgent.includes('iPhone')
}

function playbackMachine(
  state: PlaybackState,
  event: { type: PlaybackEvent }
): PlaybackState {
  switch (event.type) {
    case PlaybackEvent.PLAY:
      return {
        ...state,
        playing: true,
        action: state.muted ? 'unmute' : 'pause'
      }
    case PlaybackEvent.PAUSE:
      return {
        ...state,
        playing: false,
        action: 'play'
      }
    case PlaybackEvent.MUTE:
      return {
        ...state,
        muted: true,
        action: state.playing ? 'unmute' : 'play'
      }
    case PlaybackEvent.UNMUTE:
      return {
        ...state,
        muted: false,
        action: state.playing ? 'pause' : 'play'
      }
  }
}

export function VideoControls({
  player,
  startAt,
  endAt,
  isYoutube = false,
  loading = false,
  muted: initialMuted = false,
  activeStep
}: VideoControlProps): ReactElement {
  const { variant } = useJourney()
  const [active, setActive] = useState(true)
  const [displayTime, setDisplayTime] = useState('0:00')
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState((player.volume() ?? 1) * 100)
  const [state, dispatch] = useReducer(playbackMachine, {
    // Explicit muted state since player.muted state lags when video paused
    muted: initialMuted,
    playing: false,
    action: 'play'
  })

  // Explicit fullscreen state since player.fullscreen state lags when video paused
  const [fullscreen, setFullscreen] = useState(
    fscreen.fullscreenElement != null || (player.isFullscreen() ?? false)
  )

  const theme = useTheme()
  const isMobile = useMediaQuery(
    `(max-width:${theme.breakpoints.values.lg - 0.5}px)`
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

  const visible = !state.playing || active || loading

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
        dispatch({ type: PlaybackEvent.MUTE })
      }
      dispatch({ type: PlaybackEvent.PLAY })
      if (startAt > 0 && (player.currentTime() ?? 0) < startAt) {
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
      dispatch({ type: PlaybackEvent.PAUSE })
      const videoHasClashingUI = isYoutube
      if (videoHasClashingUI && activeStep) {
        setShowHeaderFooter(false)
      }
    }
    player.on('pause', handleVideoPause)
    return () => {
      player.off('pause', handleVideoPause)
    }
  }, [player, isYoutube, setShowHeaderFooter, activeStep])

  // Handle time update event
  useEffect(() => {
    // Recalculate for startAt/endAt snippet
    const handleVideoTimeChange = (): void => {
      if (endAt > 0 && (player.currentTime() ?? 0) > endAt) {
        // 1) Trigger pause, we get an error if trying to update time here
        player.pause()
      }
      if ((player.currentTime() ?? 0) >= startAt) {
        setDisplayTime(
          secondsToTimeFormat((player.currentTime() ?? 0) - startAt, {
            trimZeroes: true
          })
        )
      }
      setProgress(player.currentTime() ?? 0)
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

  // Handle volume change event
  useEffect(() => {
    const handleVideoVolumeChange = (): void =>
      setVolume((player.volume() ?? 1) * 100)

    player.on('volumechange', handleVideoVolumeChange)
    return () => {
      player.off('volumechange', handleVideoVolumeChange)
    }
  }, [player])

  // Handle fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = (): void => {
      const fullscreen =
        fscreen.fullscreenElement != null || (player.isFullscreen() ?? false)
      setFullscreen(fullscreen)

      const videoHasClashingUI =
        isYoutube && !state.playing && (player.userActive() ?? true)
      if (videoHasClashingUI) {
        setShowHeaderFooter(false)
      } else {
        setShowHeaderFooter(!fullscreen)
      }

      if (!fullscreen && variant === 'embed' && !iPhone()) {
        player.pause()
      }

      if (fullscreen && variant === 'embed' && !iPhone()) {
        void player.play()
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
  }, [
    player,
    isYoutube,
    state,
    setShowHeaderFooter,
    setShowNavigation,
    variant
  ])

  function handlePlay(): void {
    if (!state.playing) {
      void player.play()
      // Youtube breaks when this is gone
      dispatch({ type: PlaybackEvent.PLAY })
    } else {
      void player.pause()
      setShowNavigation(true)
      dispatch({ type: PlaybackEvent.PAUSE })
    }
  }

  const handlePlaybackEvent = (): void => {
    // Ensures desktop only uses play/pause events
    if (!isMobile) {
      handlePlay()
    } else {
      const mobileActions = {
        play: handlePlay,
        pause: handlePlay,
        unmute: handleMute
      }

      mobileActions[state.action]()
    }
  }

  function handleFullscreen(): void {
    if (variant === 'embed' && !iPhone()) return
    if (fullscreen) {
      if (fscreen.fullscreenEnabled) {
        void fscreen.exitFullscreen()
      } else {
        void player.exitFullscreen()
      }
    } else {
      if (fscreen.fullscreenEnabled) {
        const activeCard = document.querySelectorAll(
          '.active-card .MuiBox-root'
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
    player.muted(!state.muted)
    state.muted
      ? dispatch({ type: PlaybackEvent.UNMUTE })
      : dispatch({ type: PlaybackEvent.MUTE })
  }

  function handleVolume(e: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      // Should handle unmuting when volume has a value, and muting when volume is zero
      if (value > 0) {
        player.muted(false)
        dispatch({ type: PlaybackEvent.UNMUTE })
        setVolume(value)
        player.volume(value / 100)
      } else {
        player.muted(true)
        dispatch({ type: PlaybackEvent.MUTE })
        setVolume(0)
      }
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

  function renderMobileControlButton(): ReactNode {
    const icons = {
      play: <PlayArrowRounded fontSize="inherit" />,
      pause: <PauseRounded fontSize="inherit" />,
      unmute: <VolumeOffOutlined fontSize="inherit" />
    }

    return icons[state.action]
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
      onClick={getClickHandler(handlePlaybackEvent, handleFullscreen)}
      onMouseMove={() => player.userActive(true)}
      onTouchEnd={(e) => {
        const target = e.target as Element
        const controlsHidden = !(player.userActive() ?? true)
        const videoControlsNotClicked =
          !target.classList.contains('MuiSlider-root') &&
          !target.classList.contains('MuiSlider-rail') &&
          !target.classList.contains('MuiSlider-track') &&
          !target.classList.contains('MuiSvgIcon-root') &&
          target.nodeName !== 'path'
        // iOS: pause video on first click, default just shows controls.
        if (controlsHidden && videoControlsNotClicked && isIOS()) {
          void player.pause()
          dispatch({ type: PlaybackEvent.PAUSE })
        }
        player.userActive(true)
      }}
      data-testid="JourneysVideoControls"
    >
      <Stack justifyContent="flex-end" sx={{ height: '100%' }}>
        <Fade
          in={state.action === 'unmute' || visible}
          style={{ transitionDuration: '500ms' }}
          timeout={{ exit: 3000 }}
        >
          {/* Mobile Play/Pause/Mute */}
          <Stack flexGrow={1} alignItems="center" justifyContent="center">
            {!loading ? (
              <IconButton
                aria-label={`center-${state.action}-button`}
                sx={{
                  fontSize: 50,
                  display: { xs: 'flex', lg: 'none' },
                  p: { xs: 2, sm: 0, md: 2 }
                }}
              >
                {renderMobileControlButton()}
              </IconButton>
            ) : (
              <CircularProgress size={65} />
            )}
          </Stack>
        </Fade>
        <Fade
          in={visible}
          style={{ transitionDuration: '500ms' }}
          timeout={{ exit: 3000 }}
        >
          {/* Progress Bar */}
          <Container
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
                aria-label={
                  state.playing ? 'bar-pause-button' : 'bar-play-button'
                }
                onClick={handlePlay}
                sx={{
                  display: { xs: 'none', lg: 'flex' },
                  ml: { xs: 0, lg: -1 }
                }}
              >
                {!state.playing ? <PlayArrowRounded /> : <PauseRounded />}
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
                  <IconButton
                    aria-label={
                      state.muted ? 'bar-unmute-button' : 'bar-mute-button'
                    }
                    onClick={handleMute}
                    sx={{ p: 0 }}
                  >
                    {state.muted || volume === 0 ? (
                      <VolumeOffOutlined />
                    ) : volume > 60 ? (
                      <VolumeUpOutlined />
                    ) : volume > 30 ? (
                      <VolumeDownOutlined />
                    ) : (
                      <VolumeMuteOutlined />
                    )}
                  </IconButton>
                </Stack>
                {(variant !== 'embed' || iPhone()) && (
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
                )}
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
        </Fade>
      </Stack>
    </Box>
  )
}
