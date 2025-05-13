import IconButton from '@mui/material/IconButton'
import { alpha } from '@mui/material/styles'
import { ReactElement } from 'react'

import Volume5 from '@core/shared/ui/icons/Volume5'
import VolumeOff from '@core/shared/ui/icons/VolumeOff'

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
        <VolumeOff sx={{ fontSize: '32px' }} />
      ) : (
        <Volume5 sx={{ fontSize: '32px' }} />
      )}
    </IconButton>
  )
}
