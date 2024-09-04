import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { CustomDatePicker } from '../CustomDatePicker'
import { MenuButton } from '../MenuButton'
import { NavbarBreadcrumbs } from '../NavbarBreadcrumbs'
import { Search } from '../Search'
import { ToggleColorMode } from '../ToggleColorMode'

export function Header(): ReactElement {
  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction="row" sx={{ gap: 1 }}>
        <Search />
        <CustomDatePicker />
        <MenuButton showBadge aria-label="Open notifications">
          <NotificationsRoundedIcon />
        </MenuButton>
        <ToggleColorMode />
      </Stack>
    </Stack>
  )
}
