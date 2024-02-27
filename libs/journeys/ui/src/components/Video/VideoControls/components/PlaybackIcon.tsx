import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { ReactNode } from 'react'

import { PlaybackState } from '../playbackReducer'

interface PlaybackIconProps {
  state: PlaybackState
  visible: boolean
  loading: boolean
}

// Playback Icon to display for mobile views in VideoControls
export function PlaybackIcon({
  state,
  visible,
  loading
}: PlaybackIconProps): ReactNode {
  function renderMobileControlButton(): ReactNode {
    const icons = {
      play: <PlayArrowRounded fontSize="inherit" />,
      pause: <PauseRounded fontSize="inherit" />,
      unmute: <VolumeOffOutlined fontSize="inherit" />
    }

    return icons[state.action]
  }

  return (
    <Fade
      in={state.action === 'unmute' || visible}
      style={{ transitionDuration: '500ms' }}
      timeout={{ exit: 3000 }}
    >
      {/* Mobile Play/Pause/Mute */}
      <Stack
        justifyContent="center"
      >
        {!loading ? (
          <IconButton
            aria-label={`center-${state.action}-button`}
            sx={{
              fontSize: 50,
              display: { xs: 'flex', lg: 'none' },
              p: { xs: 2, sm: 0, md: 2 }
            }}
          >
            {renderMobileControlButton()}
          </IconButton>
        ) : (
          <CircularProgress size={65} />
        )}
      </Stack>
    </Fade>
  )
}
