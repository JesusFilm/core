import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded'
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded'
import IconButton from '@mui/material/IconButton'
import { alpha } from '@mui/material/styles'
import { ReactElement } from 'react'

interface ContentHeroMuteButtonProps {
  isMuted: boolean

  onClick: () => void
}

export function ContentHeroMuteButton({
  isMuted,
  onClick
}: ContentHeroMuteButtonProps): ReactElement {
  return (
    <IconButton
      disableRipple
      size="large"
      onClick={onClick}
      sx={{
        width: '56px',
        height: '56px',
        bgcolor: ({ palette }) => alpha(palette.text.secondary, 0.5),
        transition: 'background-color 0.2s',
        '&:hover': {
          bgcolor: ({ palette }) => alpha(palette.text.secondary, 0.3)
        }
      }}
      aria-label={isMuted ? 'muted' : 'unmuted'}
    >
      {isMuted ? (
        <VolumeOffRoundedIcon sx={{ fontSize: '32px' }} />
      ) : (
        <VolumeUpRoundedIcon sx={{ fontSize: '32px' }} />
      )}
    </IconButton>
  )
}
