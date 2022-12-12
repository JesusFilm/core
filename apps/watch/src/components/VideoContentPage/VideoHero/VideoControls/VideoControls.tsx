import { MutableRefObject, ReactElement, useState, useEffect } from 'react'
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
  playerRef: MutableRefObject<videojs.Player | undefined>
  fullscreen: boolean
  setFullscreen: (fullscreen: boolean) => void
}

export function VideoControls({
  playerRef,
  fullscreen,
  setFullscreen
}: VideoControlProps): ReactElement {
  const [play, setPlay] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>()
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0)
  const [mute, setMute] = useState(false)

  const timeFormatToHHMMSS = (time: number): string => {
    return time < 3600
      ? new Date(time * 1000).toISOString().substring(14, 19)
      : new Date(time * 1000).toISOString().substring(11, 19)
  }

  let duration
  let durationSeconds
  if (playerRef?.current != null) {
    duration = timeFormatToHHMMSS(playerRef?.current?.duration())
    durationSeconds = Math.round(playerRef?.current?.duration())
  }

  useEffect(() => {
    if (playerRef.current != null) {
      playerRef.current.on('ready', () => {
        if (playerRef.current != null) {
          setVolume(playerRef.current.volume() * 100)
        }
      })
      playerRef.current.on('play', () => {
        if (playerRef.current != null) {
          setPlay(true)
        }
      })
      playerRef.current.on('pause', () => {
        if (playerRef.current != null) {
          setPlay(false)
        }
      })
      playerRef.current.on('timeupdate', () => {
        if (playerRef.current != null) {
          setCurrentTime(timeFormatToHHMMSS(playerRef?.current?.currentTime()))
          setProgress(Math.round(playerRef.current.currentTime()))
        }
      })
      playerRef.current.on('fullscreenchange', () => {
        if (playerRef.current != null) {
          if (!playerRef.current.isFullscreen()) {
            setFullscreen(false)
          }
        }
      })
    }
  }, [playerRef, currentTime, setFullscreen])

  function handlePlay(): void {
    if (playerRef?.current == null) return
    if (!play) {
      setPlay(true)
      playerRef?.current.play()
    } else {
      setPlay(false)
      playerRef?.current.pause()
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
    if (playerRef?.current == null) return
    if (!fullscreen) {
      setFullscreen(true)
      playerRef.current.requestFullscreen()
    }
  }

  function handleProgress(_event: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      setProgress(value)
      if (playerRef.current != null) {
        playerRef.current.currentTime(value)
      }
    }
  }

  function handleMute(): void {
    if (playerRef?.current == null) return
    setMute(!mute)
    playerRef?.current?.muted(!mute)
  }

  function handleVolume(_event: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      setVolume(value)
      if (playerRef.current != null) {
        playerRef.current.volume(value / 100)
      }
    }
  }

  console.log(playerRef.current)

  return (
    <Container
      maxWidth="xxl"
      sx={{
        position: 'relative',
        backgroundColor: 'transparent',
        alignSelf: 'end',
        zIndex: 5,
        pb: 4
      }}
    >
      <Slider
        aria-label="progress-control"
        min={0}
        max={durationSeconds}
        value={progress}
        valueLabelFormat={(value) => {
          return timeFormatToHHMMSS(value)
        }}
        valueLabelDisplay="auto"
        onChange={handleProgress}
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
          aria-label="progress-control"
          min={0}
          max={durationSeconds}
          value={progress}
          valueLabelFormat={(value) => {
            return timeFormatToHHMMSS(value)
          }}
          valueLabelDisplay="auto"
          onChange={handleProgress}
          sx={{
            height: 8.4,
            display: { xs: 'none', md: 'flex' },
            '& .MuiSlider-thumb': {
              width: 13,
              height: 13
            }
          }}
        />
        {playerRef?.current != null && (
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
              aria-label="progress-control"
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
