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
import FullscreenExitOutlined from '@mui/icons-material/FullscreenExitOutlined'

interface VideoControlProps {
  playerRef: MutableRefObject<videojs.Player | undefined>
}

export function VideoControls({ playerRef }: VideoControlProps): ReactElement {
  const [play, setPlay] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
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
      playerRef.current.on('timeupdate', () => {
        if (playerRef.current != null) {
          setCurrentTime(timeFormatToHHMMSS(playerRef?.current?.currentTime()))
          setProgress(Math.round(playerRef.current.currentTime()))
        }
      })
      playerRef.current.on('pause', () => {
        if (playerRef.current != null) {
          setPlay(false)
        }
      })
      playerRef.current.on('play', () => {
        if (playerRef.current != null) {
          setPlay(true)
        }
      })
    }
  }, [playerRef, currentTime])

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
    } else {
      setFullscreen(false)
      playerRef.current.exitFullscreen()
    }
  }

  function handleMute(): void {
    if (playerRef?.current == null) return
    setVolume(0)
    setMute(!mute)
    playerRef?.current?.muted(!mute)
  }

  function handleProgress(_event: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      setProgress(value)
      if (playerRef.current != null) {
        playerRef.current.currentTime(value)
      }
    }
  }

  function handleVolume(_event: Event, value: number | number[]): void {
    if (!Array.isArray(value)) {
      setVolume(value)
      if (playerRef.current != null) {
        playerRef.current.volume(value / 100)
      }
    }
  }

  return (
    <Container
      maxWidth="xxl"
      sx={{
        position: 'relative',
        backgroundColor: 'background.default',
        zIndex: 5
      }}
    >
      <Stack direction="row" gap={5} alignItems="center">
        <IconButton onClick={handlePlay}>
          {!play ? <PlayArrowRounded /> : <PauseRounded />}
        </IconButton>
        <Slider
          aria-label="progress-control"
          min={0}
          max={durationSeconds}
          value={progress}
          valueLabelDisplay="auto"
          onChange={handleProgress}
          sx={{
            height: 8.4,
            '& .MuiSlider-thumb': {
              width: 15,
              height: 15
            }
          }}
        />
        {playerRef?.current != null && (
          <Typography variant="body2" color="secondary.contrastText">
            {currentTime}/{duration}
          </Typography>
        )}
        <Stack alignItems="center" spacing={1} direction="row">
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
            value={volume}
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
          {!fullscreen ? <FullscreenOutlined /> : <FullscreenExitOutlined />}
        </IconButton>
      </Stack>
    </Container>
  )
}
