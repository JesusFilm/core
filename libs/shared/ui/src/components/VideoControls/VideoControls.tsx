import { ReactElement, useState, useEffect, MouseEventHandler } from 'react'
import videojs from 'video.js'
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
import { secondsToTimeFormat } from '../../libs/timeFormat'

interface VideoControlProps {
  player: videojs.Player
  startAt: number
  endAt: number
}

function isMobile(): boolean {
  const userAgent = navigator.userAgent
  return /windows phone/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)
}

export function VideoControls({
  player,
  startAt,
  endAt
}: VideoControlProps): ReactElement {
  const [play, setPlay] = useState(false)
  const [active, setActive] = useState(true)
  const [displayTime, setDisplayTime] = useState<string>()
  const [progress, setProgress] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [loading, setLoading] = useState(false)

  const durationSeconds = endAt - startAt
  const duration = secondsToTimeFormat(durationSeconds, { trimZeroes: true })

  const visible = !play || active || loading

  useEffect(() => {
    player.on('play', () => {
      setPlay(true)
    })
    player.on('pause', () => {
      setPlay(false)
    })
    // Recalculate for startAt/endAt snippet
    player.on('timeupdate', () => {
      setDisplayTime(
        secondsToTimeFormat(player.currentTime() - startAt, {
          trimZeroes: true
        })
      )
      setProgress(Math.round(player.currentTime()))
    })
    player.on('fullscreenchange', () => {
      setFullscreen(player.isFullscreen())
    })
    player.on('useractive', () => setActive(true))
    player.on('userinactive', () => setActive(false))
    player.on('waiting', () => setLoading(true))
    player.on('playing', () => setLoading(false))
    player.on('ended', () => {
      setLoading(false)
    })
    player.on('canplay', () => setLoading(false))
    player.on('canplaythrough', () => setLoading(false))
    fscreen.addEventListener('fullscreenchange', () => {
      setFullscreen(fscreen.fullscreenElement != null)
    })
  }, [player, setFullscreen, loading])

  function handlePlay(): void {
    if (!play) {
      void player.play()
    } else {
      void player.pause()
    }
  }

  async function handleFullscreen(): Promise<void> {
    if (fullscreen) {
      fscreen.exitFullscreen()
      setFullscreen(false)
    } else {
      if (isMobile()) {
        player.requestFullscreen()
      } else {
        await fscreen.requestFullscreen(document.documentElement)
        setFullscreen(true)
      }
    }
  }

  function handleSeek(event: Event, value: number | number[]): void {
    event.stopPropagation()
    console.log('value', value)
    if (!Array.isArray(value)) {
      setProgress(value)
      player.currentTime(value)
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
      id="video-controls"
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
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
        style={{ transitionDuration: '225ms' }}
        timeout={{ exit: 2225 }}
      >
        <Stack justifyContent="flex-end" sx={{ height: '100%' }}>
          {/* Play/Pause */}
          <Stack flexGrow={1} alignItems="center" justifyContent="center">
            {!loading ? (
              <IconButton
                sx={{
                  fontSize: 100,
                  display: { xs: 'flex', md: 'none' }
                }}
              >
                {play ? (
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
            sx={{ zIndex: 1, pb: 26 }}
          >
            <Slider
              aria-label="mobile-progress-control"
              min={startAt}
              max={endAt}
              value={progress}
              valueLabelFormat={(value) => {
                return secondsToTimeFormat(value, { trimZeroes: true })
              }}
              valueLabelDisplay="auto"
              onChange={handleSeek}
              sx={{
                width: 'initial',
                height: 5,
                mx: 2.5,
                display: { xs: 'flex', md: 'none' },
                '& .MuiSlider-thumb': {
                  display: 'none'
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
              justifyContent={{ xs: 'space-between', md: 'none' }}
              alignItems="center"
            >
              <IconButton
                id={play ? 'pause-button' : 'play-button'}
                onClick={handlePlay}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                {!play ? (
                  <PlayArrowRounded fontSize="large" />
                ) : (
                  <PauseRounded fontSize="large" />
                )}
              </IconButton>
              <Slider
                aria-label="desktop-progress-control"
                min={startAt}
                max={endAt}
                value={progress}
                valueLabelFormat={(value) => {
                  return secondsToTimeFormat(value, { trimZeroes: true })
                }}
                valueLabelDisplay="auto"
                onChange={handleSeek}
                sx={{
                  height: 8,
                  display: { xs: 'none', md: 'flex' },
                  '& .MuiSlider-thumb': {
                    width: 13,
                    height: 13
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
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: { xs: '100%', md: 'unset' }, pl: 2.5, pr: 1.5 }}
              >
                {player != null && (
                  <Typography
                    variant="caption"
                    color="secondary.main"
                    noWrap
                    overflow="unset"
                    paddingRight={4}
                  >
                    {displayTime} / {duration}
                  </Typography>
                )}
                <IconButton onClick={handleFullscreen} sx={{ p: 0 }}>
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
