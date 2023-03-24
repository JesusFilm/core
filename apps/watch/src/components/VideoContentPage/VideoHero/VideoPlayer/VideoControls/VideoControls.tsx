import { ReactElement, useState, useEffect, MouseEventHandler } from 'react'
import Container from '@mui/material/Container'
import { VideoJsPlayer } from 'video.js'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import PauseRounded from '@mui/icons-material/PauseRounded'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import VolumeDownOutlined from '@mui/icons-material/VolumeDownOutlined'
import VolumeMuteOutlined from '@mui/icons-material/VolumeMuteOutlined'
import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import SubtitlesOutlined from '@mui/icons-material/SubtitlesOutlined'
import FullscreenOutlined from '@mui/icons-material/FullscreenOutlined'
import FullscreenExitOutlined from '@mui/icons-material/FullscreenExitOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'
import fscreen from 'fscreen'
import dynamic from 'next/dynamic'
import TagManager from 'react-gtm-module'
import debounce from 'lodash/debounce'
import { useVideo } from '../../../../../libs/videoContext'
import { AudioLanguageButton } from '../../../AudioLanguageButton'

const DynamicSubtitleDialog = dynamic<{
  open: boolean
  player: VideoJsPlayer
  onClose: () => void
}>(
  async () =>
    await import(
      /* webpackChunkName: "SubtitleDialog" */
      '../../../../SubtitleDialog'
    ).then((mod) => mod.SubtitleDialog)
)

interface VideoControlProps {
  player: VideoJsPlayer
  onVisibleChanged?: (active: boolean) => void
}

function isMobile(): boolean {
  const userAgent = navigator.userAgent
  return /windows phone/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)
}

function evtToDataLayer(eventType, title, language, percent): void {
  TagManager.dataLayer({
    dataLayer: {
      event: eventType,
      title,
      language,
      percent
    }
  })
}
const eventToDataLayer = debounce(evtToDataLayer, 500)

export function VideoControls({
  player,
  onVisibleChanged
}: VideoControlProps): ReactElement {
  const [play, setPlay] = useState(false)
  const [active, setActive] = useState(true)
  const [currentTime, setCurrentTime] = useState<string>()
  const [progress, setProgress] = useState(0)
  const [progressPercentNotYetEmitted, setProgressPercentNotYetEmitted] =
    useState([10, 25, 50, 75, 90])
  const [volume, setVolume] = useState(0)
  const [mute, setMute] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [openSubtitleDialog, setOpenSubtitleDialog] = useState(false)
  const [loadSubtitleDialog, setLoadSubtitleDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const duration = secondsToTimeFormat(player.duration(), { trimZeroes: true })
  const durationSeconds = Math.round(player.duration())
  const { title, variant } = useVideo()
  const visible = !play || active || loading

  useEffect(() => {
    onVisibleChanged?.(!play || active || loading)
  }, [play, active, loading, onVisibleChanged])

  useEffect(() => {
    if ((progress / durationSeconds) * 100 > progressPercentNotYetEmitted[0]) {
      eventToDataLayer(
        `video_time_update_${progressPercentNotYetEmitted[0]}`,
        title[0].value,
        variant?.language.name[0].value,
        Math.round((progress / durationSeconds) * 100)
      )
      const [, ...rest] = progressPercentNotYetEmitted
      setProgressPercentNotYetEmitted(rest)
    }
  }, [progress, durationSeconds, progressPercentNotYetEmitted, title, variant])

  useEffect(() => {
    setVolume(player.volume() * 100)
    player.on('play', () => {
      eventToDataLayer(
        'video_play',
        title[0].value,
        variant?.language.name[0].value,
        Math.round((player.currentTime() / player.duration()) * 100)
      )
      setPlay(true)
    })
    player.on('pause', () => {
      eventToDataLayer(
        'video_pause',
        title[0].value,
        variant?.language.name[0].value,
        Math.round((player.currentTime() / player.duration()) * 100)
      )
      setPlay(false)
    })
    player.on('timeupdate', () => {
      setCurrentTime(
        secondsToTimeFormat(player.currentTime(), { trimZeroes: true })
      )
      setProgress(Math.round(player.currentTime()))
    })
    player.on('volumechange', () => {
      setMute(player.muted())
      setVolume(player.volume() * 100)
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
      eventToDataLayer(
        'video_ended',
        title[0].value,
        variant?.language.name[0].value,
        Math.round((player.currentTime() / player.duration()) * 100)
      )
    })
    player.on('canplay', () => setLoading(false))
    player.on('canplaythrough', () => setLoading(false))
    fscreen.addEventListener('fullscreenchange', () => {
      if (fscreen.fullscreenElement != null) {
        eventToDataLayer(
          'video_enter_full_screen',
          title[0].value,
          variant?.language.name[0].value,
          Math.round((player.currentTime() / player.duration()) * 100)
        )
      } else {
        eventToDataLayer(
          'video_exit_full_screen',
          title[0].value,
          variant?.language.name[0].value,
          Math.round((player.currentTime() / player.duration()) * 100)
        )
      }
      setFullscreen(fscreen.fullscreenElement != null)
    })
  }, [player, setFullscreen, loading, title, variant])

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

  function handleSeek(_event: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      setProgress(value)
      player.currentTime(value)
    }
  }

  function handleMute(): void {
    player.muted(!mute)
  }

  function handleVolume(_event: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
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

  function handleClick(): void {
    setOpenSubtitleDialog(true)
    setLoadSubtitleDialog(true)
  }

  return (
    <Box
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
        style={{
          transitionDelay: visible ? undefined : '2s',
          transitionDuration: '225ms'
        }}
        timeout={{ exit: 2225 }}
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '104px'
            }}
          >
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
          </Box>

          <Box
            sx={{
              background:
                'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%)'
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <Container
              data-testid="vjs-jfp-custom-controls"
              maxWidth="xxl"
              sx={{
                zIndex: 5,
                pb: 4,
                transitionDelay: visible ? undefined : '0.5s'
              }}
            >
              <Slider
                aria-label="mobile-progress-control"
                min={0}
                max={durationSeconds}
                value={progress}
                valueLabelFormat={(value) => {
                  return secondsToTimeFormat(value, { trimZeroes: true })
                }}
                valueLabelDisplay="auto"
                onChange={handleSeek}
                sx={{
                  height: 8.4,
                  display: { xs: 'flex', md: 'none' },
                  '& .MuiSlider-thumb': {
                    width: 13,
                    height: 13
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'secondary.main'
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
                  min={0}
                  max={durationSeconds}
                  value={progress}
                  valueLabelFormat={(value) => {
                    return secondsToTimeFormat(value, { trimZeroes: true })
                  }}
                  valueLabelDisplay="auto"
                  onChange={handleSeek}
                  sx={{
                    height: 8.4,
                    display: { xs: 'none', md: 'flex' },
                    '& .MuiSlider-thumb': {
                      width: 13,
                      height: 13
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'secondary.main'
                    }
                  }}
                />
                {player != null && (
                  <Typography variant="body2" color="secondary.contrastText">
                    {currentTime}/{duration}
                  </Typography>
                )}
                <Stack direction="row" spacing={2}>
                  <Stack
                    alignItems="center"
                    spacing={2}
                    direction="row"
                    sx={{
                      display: { xs: 'none', md: 'flex' },
                      '> .MuiSlider-root': {
                        width: 0,
                        opacity: 0,
                        transition: 'all 0.2s ease-out'
                      },
                      '&:hover': {
                        '> .MuiSlider-root': {
                          width: 70,
                          opacity: 1
                        }
                      }
                    }}
                  >
                    <IconButton onClick={handleMute}>
                      {mute || volume === 0 ? (
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
                      value={mute ? 0 : volume}
                      valueLabelFormat={(value) => {
                        return `${value}%`
                      }}
                      valueLabelDisplay="auto"
                      onChange={handleVolume}
                      sx={{
                        width: 70,
                        '& .MuiSlider-thumb': {
                          width: 10,
                          height: 10
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: 'secondary.main'
                        }
                      }}
                    />
                  </Stack>
                  <AudioLanguageButton componentVariant="icon" />
                  <IconButton
                    onClick={handleClick}
                    disabled={
                      variant?.subtitleCount === undefined ||
                      variant?.subtitleCount < 1
                    }
                  >
                    <SubtitlesOutlined />
                  </IconButton>
                  <IconButton onClick={handleFullscreen}>
                    {fullscreen ? (
                      <FullscreenExitOutlined />
                    ) : (
                      <FullscreenOutlined />
                    )}
                  </IconButton>
                </Stack>
              </Stack>
              {loadSubtitleDialog && (
                <DynamicSubtitleDialog
                  open={openSubtitleDialog}
                  player={player}
                  onClose={() => setOpenSubtitleDialog(false)}
                />
              )}
            </Container>
          </Box>
        </Box>
      </Fade>
    </Box>
  )
}
