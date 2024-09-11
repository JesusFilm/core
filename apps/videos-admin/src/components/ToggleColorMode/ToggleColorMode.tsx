import ModeNightRoundedIcon from '@mui/icons-material/ModeNightRounded'
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded'
import { useColorScheme } from '@mui/material/styles'
import { ComponentProps, ReactElement } from 'react'

import { MenuButton } from '../MenuButton'

interface ToggleColorModeProps extends ComponentProps<typeof MenuButton> {}

export function ToggleColorMode(props: ToggleColorModeProps): ReactElement {
  const { mode, setMode } = useColorScheme()

  function toggleColorMode(): void {
    const newMode = mode === 'dark' ? 'light' : 'dark'
    setMode(newMode)
  }

  return (
    <MenuButton
      onClick={toggleColorMode}
      size="small"
      aria-label="button to toggle theme"
      {...props}
    >
      {mode === 'dark' ? (
        <WbSunnyRoundedIcon
          fontSize="small"
          data-testid="ToggleColorModeLight"
        />
      ) : (
        <ModeNightRoundedIcon
          fontSize="small"
          data-testid="ToggleColorModeDark"
        />
      )}
    </MenuButton>
  )
}
