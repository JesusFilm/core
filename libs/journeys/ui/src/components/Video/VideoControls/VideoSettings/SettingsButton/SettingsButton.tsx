import SettingsIcon from '@mui/icons-material/Settings'
import IconButton from '@mui/material/IconButton'
import { MouseEvent, ReactElement } from 'react'

interface SettingsButtonProps {
  onClick: (event: MouseEvent<HTMLElement>) => void
  open: boolean
}

export function SettingsButton({
  onClick,
  open
}: SettingsButtonProps): ReactElement {
  return (
    <IconButton
      onClick={onClick}
      aria-label="video settings"
      aria-controls="settings-menu"
      aria-expanded={open}
      aria-haspopup={open}
      sx={{
        color: 'common.white',
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
    >
      <SettingsIcon />
    </IconButton>
  )
}
