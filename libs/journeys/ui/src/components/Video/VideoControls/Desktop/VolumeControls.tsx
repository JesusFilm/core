import VolumeDownOutlined from '@mui/icons-material/VolumeDownOutlined'
import VolumeMuteOutlined from '@mui/icons-material/VolumeMuteOutlined'
import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'

interface VolumeControlsProps {
  volume: number
  handleVolume: (e: Event, value: number | number[]) => void
  muted: boolean
  handleMute: () => void
}

export function VolumeControls({
  volume,
  handleVolume,
  muted,
  handleMute
}: VolumeControlsProps): JSX.Element {
  return (
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
        // value={player.muted() ?? false ? 0 : volume}
        value={volume}
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
  )
}
