import { ReactElement, useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import videojs from 'video.js'
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
import LanguageRounded from '@mui/icons-material/LanguageRounded'
import FullscreenOutlined from '@mui/icons-material/FullscreenOutlined'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

interface VideoControlProps {
  player: videojs.Player
}

export function VideoControls({ player }: VideoControlProps): ReactElement {
  const [play, setPlay] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>()
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0)
  const [mute, setMute] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const duration = secondsToTimeFormat(player.duration(), { trimZeroes: true })
  const durationSeconds = Math.round(player.duration())

  useEffect(() => {
    setVolume(player.volume() * 100)
    player.on('play', () => {
      setPlay(true)
    })
    player.on('pause', () => {
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
  }, [player, setFullscreen])

  function handlePlay(): void {
    if (!play) {
      void player.play()
    } else {
      void player.pause()
    }
  }

  function handleFullscreen(): void {
    if (!fullscreen) {
      player.requestFullscreen()
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

  return (
    <Container
      data-testid="vjs-jfp-custom-controls"
      maxWidth="xxl"
      sx={{
        position: 'relative',
        alignSelf: 'end',
        zIndex: 5,
        pb: 4,
        background:
          'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%)'
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
          <IconButton>
            <LanguageRounded />
          </IconButton>
          <IconButton>
            <SubtitlesOutlined />
          </IconButton>
          <IconButton onClick={handleFullscreen}>
            <FullscreenOutlined />
          </IconButton>
        </Stack>
      </Stack>
    </Container>
  )
}
