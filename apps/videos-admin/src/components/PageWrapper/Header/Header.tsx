import AppBar from '@mui/material/AppBar'
import { ReactElement } from 'react'

import { BreadcrumbNavigation } from './BreadcrumbNavigation'

export function Header(): ReactElement {
  return (
    <AppBar
      data-testid="VideosAdminHeader"
      color="default"
      sx={{
        top: 0,
        left: 'auto',
        right: 'auto',
        position: { xs: 'fixed', md: 'sticky' },
        height: 45,
        display: 'flex',
        justifyContent: 'center',
        px: 4
      }}
    >
      <BreadcrumbNavigation />
    </AppBar>
  )
}
