import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import fscreen from 'fscreen'
import {
  MouseEventHandler,
  ReactElement,
  useEffect,
  useReducer,
  useState
} from 'react'

import { isIOS, isIPhone } from '@core/shared/ui/deviceUtils'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { useBlocks } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'
import {
  PlaybackEvent,
  type PlaybackState,
  playbackReducer
} from '../utils/playbackReducer'
import VideoJsPlayer from '../utils/videoJsTypes'
import { VideoStats } from '../VideoStats'

import { DesktopControls } from './DesktopControls'
import { MobileControls } from './MobileControls'
import { PlaybackIcon } from './PlaybackIcon'

interface VideoControlProps {
  player: VideoJsPlayer
  startAt: number
  endAt: number
  isYoutube?: boolean
  loading?: boolean
  autoplay?: boolean
  muted?: boolean
  activeStep?: boolean
}

export function VideoControls({
  player,
  startAt,
  endAt,
  isYoutube = false,
  loading = false,
  muted: initialMuted = false,
  activeStep = false
}: VideoControlProps): ReactElement {
  const { variant } = useJourney()
  const [active, setActive] = useState(true)
  const [displayTime, setDisplayTime] = useState('0:00')
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState((player.volume() ?? 1) * 100)
  const [showStats, setShowStats] = useState(false)
  const [state, dispatch] = useReducer(playbackReducer, {
    // Explicit muted state since player.muted state lags when video paused
    muted: initialMuted,
    playing: false,
    action: 'play'
  } as PlaybackState)

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

      if (!fullscreen && variant === 'embed' && !isIPhone() && activeStep) {
        player.pause()
      }

      if (fullscreen && variant === 'embed' && !isIPhone() && activeStep) {
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
    variant,
    activeStep
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
    if (variant === 'embed' && !isIPhone()) return
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
    state.muted
      ? dispatch({ type: PlaybackEvent.UNMUTE })
      : dispatch({ type: PlaybackEvent.MUTE })

    player.muted(!state.muted)
  }

  function handleVolume(e: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      // Should mute when volume is zero to prevent extra click on unmute button when volume is dragged to zero
      if (value > 0) {
        player.muted(false)
        setVolume(value)
        dispatch({ type: PlaybackEvent.UNMUTE })
        player.volume(value / 100)
      } else {
        player.muted(true)
        dispatch({ type: PlaybackEvent.MUTE })
        setVolume(0)
        player.volume(0)
      }
    }
  }

  function handleToggleStats(event: React.MouseEvent): void {
    event.stopPropagation()
    setShowStats((prev) => !prev)
    player.userActive(true)
  }

  function getClickHandler(
    onClick: MouseEventHandler,
    onDblClick: MouseEventHandler,
    delay = 250
  ): MouseEventHandler {
    let timeoutID: NodeJS.Timeout | undefined
    return (event) => {
      event.stopPropagation()
      if (timeoutID == null) {
        timeoutID = setTimeout(() => {
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
      <Stack
        justifyContent="center"
        sx={{ height: '100%' }}
        flexGrow={1}
        alignItems="center"
      >
        <PlaybackIcon state={state} loading={loading} visible={visible} />

        {/* Add VideoStats component outside of the Fade component so it stays visible */}
        {showStats && (
          <VideoStats player={player} startAt={startAt} endAt={endAt} />
        )}

        <Fade
          in
          style={{ transitionDuration: '500ms' }}
          timeout={{ exit: 3000 }}
        >
          {/* Mobile and Desktop Video Controls */}
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
              },
              position: 'absolute',
              bottom: 0
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <MobileControls
              showTime={player != null && duration != null}
              displayTime={displayTime}
              duration={duration}
              startAt={startAt}
              endAt={endAt}
              progress={progress}
              handleSeek={handleSeek}
              disableProgress={!player.hasStarted_}
              showFullscreenButton={variant !== 'embed' || isIPhone()}
              fullscreen={fullscreen}
              handleFullscreen={handleFullscreen}
              handleToggleStats={handleToggleStats}
              player={player}
            />
            <DesktopControls
              playing={state.playing}
              handlePlay={handlePlay}
              showTime={player != null && duration != null}
              displayTime={displayTime}
              duration={duration}
              startAt={startAt}
              endAt={endAt}
              progress={progress}
              handleSeek={handleSeek}
              volume={volume}
              handleVolume={handleVolume}
              muted={state.muted}
              handleMute={handleMute}
              playerMuted={player.muted() ?? false}
              showFullscreenButton={variant !== 'embed' || isIPhone()}
              fullscreen={fullscreen}
              handleFullscreen={handleFullscreen}
              handleToggleStats={handleToggleStats}
              player={player}
            />
          </Container>
        </Fade>
      </Stack>
    </Box>
  )
}
