import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { ToggleColorMode } from '../../../components/ToggleColorMode'

import { NavbarBreadcrumbs } from './_Breadcrumbs'

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
        <ToggleColorMode />
      </Stack>
    </Stack>
  )
}
