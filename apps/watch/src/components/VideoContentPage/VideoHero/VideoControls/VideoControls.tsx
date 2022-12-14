import { ReactElement, useState, useEffect, useCallback } from 'react'
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

interface VideoControlProps {
  player: videojs.Player
  fullscreen: boolean
  setFullscreen: (fullscreen: boolean) => void
}

export function VideoControls({
  player,
  fullscreen,
  setFullscreen
}: VideoControlProps): ReactElement {
  const [play, setPlay] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>()
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0)
  const [mute, setMute] = useState(false)

  const timeFormatToHHMMSS = useCallback((time: number): string => {
    let durationFormat
    const valid = !Number.isNaN(time)
    if (valid) {
      durationFormat =
        time < 3600
          ? new Date(time * 1000).toISOString().slice(14, 19)
          : new Date(time * 1000).toISOString().slice(11, 19)
    }
    return durationFormat
  }, [])

  const duration = timeFormatToHHMMSS(player.duration())
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
      setCurrentTime(timeFormatToHHMMSS(player?.currentTime()))
      setProgress(Math.round(player.currentTime()))
    })
    player.on('fullscreenchange', () => {
      if (!player.isFullscreen()) {
        setFullscreen(false)
      }
    })
  }, [player, setFullscreen, timeFormatToHHMMSS])

  function handlePlay(): void {
    if (!play) {
      setPlay(true)
      void player.play()
    } else {
      setPlay(false)
      player.pause()
    }
  }

  function handleLanguage(): void {
    // call subtitle dialog
    alert('language dialog')
  }

  function handleSubtitles(): void {
    // call subtitle dialog
    alert('subtitle dialog')
  }

  function handleFullscreen(): void {
    if (!fullscreen) {
      setFullscreen(true)
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
    setMute(!mute)
    player?.muted(!mute)
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
          return timeFormatToHHMMSS(value)
        }}
        valueLabelDisplay="auto"
        onChange={handleSeek}
        sx={{
          height: 8.4,
          display: { xs: 'flex', md: 'none' },
          '& .MuiSlider-thumb': {
            width: 13,
            height: 13
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
            return timeFormatToHHMMSS(value)
          }}
          valueLabelDisplay="auto"
          onChange={handleSeek}
          sx={{
            height: 8.4,
            display: { xs: 'none', md: 'flex' },
            '& .MuiSlider-thumb': {
              width: 13,
              height: 13
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
                }
              }}
            />
          </Stack>
          <IconButton onClick={handleLanguage}>
            <LanguageRounded />
          </IconButton>
          <IconButton onClick={handleSubtitles}>
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
