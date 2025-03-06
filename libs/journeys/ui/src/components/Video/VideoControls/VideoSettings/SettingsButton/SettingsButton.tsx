import SettingsIcon from '@mui/icons-material/Settings'
import IconButton from '@mui/material/IconButton'
import { MouseEvent, ReactElement } from 'react'

interface SettingsButtonProps {
  onClick: (event: MouseEvent<HTMLElement>) => void
  'aria-controls'?: string
  'aria-expanded'?: boolean
  'aria-haspopup'?: boolean
}

export function SettingsButton({
  onClick,
  'aria-controls': ariaControls,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHasPopup
}: SettingsButtonProps): ReactElement {
  return (
    <IconButton
      onClick={onClick}
      aria-label="video settings"
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
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
