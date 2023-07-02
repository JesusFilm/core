import { ReactElement, useState, useEffect, MouseEventHandler } from 'react'
import Player from 'video.js/dist/types/player'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import PauseRounded from '@mui/icons-material/PauseRounded'
import FullscreenRounded from '@mui/icons-material/FullscreenRounded'
import FullscreenExitRounded from '@mui/icons-material/FullscreenExitRounded'
import CircularProgress from '@mui/material/CircularProgress'
import fscreen from 'fscreen'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import VolumeDownOutlined from '@mui/icons-material/VolumeDownOutlined'
import VolumeMuteOutlined from '@mui/icons-material/VolumeMuteOutlined'
import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

interface VideoControlProps {
  player: Player
  startAt: number
  endAt: number
  isYoutube?: boolean
  loading?: boolean
}

function isMobile(): boolean {
  const userAgent = navigator.userAgent
  return /windows phone/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)
}

export function VideoControls({
  player,
  startAt,
  endAt,
  isYoutube = false,
  loading = false
}: VideoControlProps): ReactElement {
  const [playing, setPlaying] = useState(false)
  const [active, setActive] = useState(true)
  const [displayTime, setDisplayTime] = useState<string>()
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const durationSeconds = endAt - startAt
  const duration = secondsToTimeFormat(durationSeconds, { trimZeroes: true })

  const visible = !playing || active || loading

  useEffect(() => {
    const handleVideoReady = (): void => {
      player.currentTime(startAt)
    }
    const handleVideoPlay = (): void => {
      setPlaying(true)

      if (startAt > 0 && player.currentTime() < startAt) {
        player.currentTime(startAt)
        setProgress(startAt)
      }
    }
    const handleVideoPause = (): void => {
      setPlaying(false)

      // 2) Loop video if at end
      if (endAt > 0 && player.currentTime() > endAt) {
        player.currentTime(startAt)
        setProgress(startAt)
        void player.play()
      }
    }
    // Recalculate for startAt/endAt snippet
    const handleVideoTimeChange = (): void => {
      if (endAt > 0 && player.currentTime() > endAt) {
        // 1) Trigger pause, we get an error if trying to update time here
        player.pause()
      }
      setDisplayTime(
        secondsToTimeFormat(player.currentTime() - startAt, {
          trimZeroes: true
        })
      )
      setProgress(Math.round(player.currentTime()))
    }
    const handleMobileFullscreenChange = (): void =>
      setFullscreen(player.isFullscreen())
    const handleUserActive = (): void => setActive(true)
    const handleUserInactive = (): void => setActive(false)
    const handleVideoVolumeChange = (): void => setVolume(player.volume() * 100)
    const handleDesktopFullscreenChange = (): void =>
      setFullscreen(fscreen.fullscreenElement != null)

    setVolume(player.volume() * 100)
    player.on('ready', handleVideoReady)
    player.on('play', handleVideoPlay)
    player.on('pause', handleVideoPause)
    player.on('timeupdate', handleVideoTimeChange)
    player.on('fullscreenchange', handleMobileFullscreenChange)
    player.on('useractive', handleUserActive)
    player.on('userinactive', handleUserInactive)
    player.on('volumechange', handleVideoVolumeChange)
    fscreen.addEventListener('fullscreenchange', handleDesktopFullscreenChange)

    return () => {
      player.off('ready', handleVideoReady)
      player.off('play', handleVideoPlay)
      player.off('pause', handleVideoPause)
      player.off('timeupdate', handleVideoTimeChange)
      player.off('fullscreenchange', handleMobileFullscreenChange)
      player.off('useractive', handleUserActive)
      player.off('userinactive', handleUserInactive)
      player.off('volumechange', handleVideoVolumeChange)
      fscreen.removeEventListener(
        'fullscreenchange',
        handleDesktopFullscreenChange
      )
    }
  }, [player, setFullscreen, startAt, endAt])

  function handlePlay(): void {
    if (!playing) {
      void player.play()
      // Youtube breaks when this is gone
      setPlaying(true)
    } else {
      void player.pause()
      setPlaying(false)
    }
  }

  async function handleFullscreen(): Promise<void> {
    console.log(fullscreen, isMobile())
    if (fullscreen) {
      fscreen.exitFullscreen()
      setFullscreen(false)
    } else {
      if (isMobile()) {
        void player.requestFullscreen()
      } else {
        await fscreen.requestFullscreen(document.documentElement)
        setFullscreen(true)
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
    player.muted(!player.muted())
  }

  function handleVolume(e: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      player.muted(false)
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
        zIndex: 4,
        top: 0,
        right: 0,
        bottom: { xs: 50, lg: 4 },
        left: 0,
        cursor: visible ? undefined : 'none'
      }}
      onClick={getClickHandler(handlePlay, () => {
        void handleFullscreen()
      })}
      onMouseMove={() => player.userActive(true)}
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
            sx={{ mt: 16, display: { lg: 'none' } }}
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
              onClick={(e) => {
                e.stopPropagation()
                handleMute()
              }}
            >
              {player.muted() ? <VolumeOffOutlined /> : <VolumeUpOutlined />}
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
                  fontSize: 100,
                  display: { xs: 'flex', lg: 'none' }
                }}
              >
                {playing ? (
                  <PauseRounded fontSize="inherit" />
                ) : (
                  <PlayArrowRounded fontSize="inherit" />
                )}
              </IconButton>
            ) : (
              !isYoutube && <CircularProgress size={65} />
            )}
          </Stack>
          {/* Progress Bar */}
          <Container
            className="swiper-no-swiping"
            data-testid="vjs-jfp-custom-controls"
            maxWidth="xxl"
            sx={{
              zIndex: 1,
              transitionDelay: visible ? undefined : '0.5s'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Slider
              aria-label="mobile-progress-control"
              min={startAt}
              max={endAt}
              value={progress}
              valueLabelFormat={displayTime}
              valueLabelDisplay="auto"
              onChange={handleSeek}
              sx={{
                width: 'initial',
                height: 5,
                mx: 2.5,
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
                max={endAt}
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
              {player != null && (
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
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      handleMute()
                    }}
                    sx={{ p: 0 }}
                  >
                    {player.muted() || volume === 0 ? (
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
                    value={player.muted() ? 0 : volume}
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
          </Container>
        </Stack>
      </Fade>
    </Box>
  )
}
