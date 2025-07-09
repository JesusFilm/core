import FullscreenExitRounded from '@mui/icons-material/FullscreenExitRounded'
import FullscreenRounded from '@mui/icons-material/FullscreenRounded'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeDownOutlined from '@mui/icons-material/VolumeDownOutlined'
import VolumeMuteOutlined from '@mui/icons-material/VolumeMuteOutlined'
import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { MouseEvent, ReactElement } from 'react'

import VideoJsPlayer from '../../utils/videoJsTypes'
import { VideoSettings } from '../VideoSettings'

interface DesktopControlsProps {
  playing: boolean
  handlePlay: () => void
  showTime: boolean
  displayTime: string
  duration: string | null
  startAt: number
  endAt: number
  progress: number
  handleSeek: (e: Event, value: number | number[]) => void
  volume: number
  handleVolume: (e: Event, value: number | number[]) => void
  muted: boolean
  handleMute: () => void
  playerMuted: boolean
  showFullscreenButton: boolean
  fullscreen: boolean
  handleFullscreen: () => void
  handleToggleStats: (event: React.MouseEvent) => void
  player: VideoJsPlayer
}

export function DesktopControls({
  playing,
  handlePlay,
  showTime,
  displayTime,
  duration,
  startAt,
  endAt,
  progress,
  handleSeek,
  volume,
  handleVolume,
  playerMuted,
  muted,
  handleMute,
  showFullscreenButton,
  fullscreen,
  handleFullscreen,
  handleToggleStats,
  player
}: DesktopControlsProps): ReactElement {
  return (
    <Stack
      data-testid="desktop-controls"
      direction="row"
      gap={5}
      alignItems="center"
      display={{
        xs: 'none',
        md: 'flex'
      }}
    >
      {/* Play/Pause Button  */}
      <IconButton
        aria-label={playing ? 'bar-pause-button' : 'bar-play-button'}
        onClick={handlePlay}
        sx={{
          ml: { xs: 0, lg: -1 }
        }}
      >
        {!playing ? <PlayArrowRounded /> : <PauseRounded />}
      </IconButton>
      {/* Time Label */}
      {showTime && (
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
      {/* Progress Bar */}
      <Slider
        aria-label="desktop-progress-control"
        min={startAt}
        max={endAt - 0.25}
        value={progress}
        onChange={handleSeek}
        valueLabelFormat={displayTime}
        valueLabelDisplay="auto"
        sx={{
          height: 8,
          display: 'flex',
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
      {/* Volume and Mute Controls */}
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
          value={playerMuted ? 0 : volume}
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
          aria-label={muted ? 'bar-unmute-button' : 'bar-mute-button'}
          onClick={handleMute}
          sx={{ p: 0 }}
        >
          {muted || volume === 0 ? (
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
      <VideoSettings player={player} onToggleStats={handleToggleStats} />
      {showFullscreenButton && (
        <IconButton
          aria-label="fullscreen"
          onClick={handleFullscreen}
          sx={{ py: 0, px: 2 }}
        >
          {fullscreen ? <FullscreenExitRounded /> : <FullscreenRounded />}
        </IconButton>
      )}
    </Stack>
  )
}
