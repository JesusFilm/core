import Close from '@mui/icons-material/Close'
import AppBar from '@mui/material/AppBar'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

import { usePage } from '../../../libs/PageWrapperProvider'
import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

interface SidePanelProps {
  children: ReactNode
  title?: string
  open?: boolean
  // TODO: Remove if admin edit page uses SidePanel instead of Drawer
  withAdminDrawer?: boolean
  onClose?: () => void
}

interface DrawerContentProps {
  title?: string
  children?: ReactNode
  onClose?: () => void
}

function DrawerContent({
  title,
  children,
  onClose
}: DrawerContentProps): ReactElement {
  const { toolbar } = usePageWrapperStyles()
  return (
    <>
      <AppBar
        data-testid="side-header"
        position="sticky"
        color="default"
        sx={{ width: 'inherit' }}
      >
        <Toolbar
          variant={toolbar.variant}
          sx={{ justifyContent: 'space-between' }}
        >
          {title != null && (
            <Typography variant="subtitle1" component="div" noWrap>
              {title}
            </Typography>
          )}
          {onClose != null && (
            <IconButton
              data-testid="close-side-drawer"
              onClick={onClose}
              sx={{ display: 'inline-flex' }}
              edge="end"
            >
              <Close />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Stack
        data-testid="side-body"
        border="hidden"
        sx={{
          overflow: 'none',
          overflowY: { sm: 'auto' }
        }}
      >
        {children}
      </Stack>
    </>
  )
}

export function SidePanel({
  children,
  title,
  open = true,
  withAdminDrawer = false,
  onClose
}: SidePanelProps): ReactElement {
  const { toolbar, sidePanel } = usePageWrapperStyles()

  const {
    state: { mobileDrawerOpen },
    dispatch
  } = usePage()

  const desktopStyle = {
    display: { xs: 'none', md: 'flex' },
    width: sidePanel.width,
    flexShrink: 1,
    '& .MuiDrawer-paper': {
      overflowX: 'hidden',
      boxSizing: 'border-box',
      width: sidePanel.width,
      height: '100%'
    }
  }
  const mobileStyle = {
    display: { xs: 'flex', md: 'none' },
    width: '100%',
    flexShrink: 1,
    '& .MuiDrawer-paper': {
      boxSizing: 'border-box',
      width: '100%',
      height: `calc(100% - ${toolbar.height})`
    }
  }

  const handleClose = (): void => {
    dispatch({
      type: 'SetMobileDrawerOpenAction',
      mobileDrawerOpen: false
    })
    onClose?.()
  }

  return (
    <>
      <Drawer
        elevation={1}
        anchor="right"
        variant="persistent"
        open={onClose != null ? open : true}
        hideBackdrop
        data-testid="side-panel"
        sx={desktopStyle}
      >
        <DrawerContent
          title={title}
          onClose={onClose != null ? handleClose : undefined}
        >
          {children}
        </DrawerContent>
      </Drawer>
      {withAdminDrawer ? (
        <Stack sx={{ display: { xs: 'flex', sm: 'none' } }}>{children}</Stack>
      ) : (
        <Drawer
          anchor="bottom"
          variant="temporary"
          open={mobileDrawerOpen}
          hideBackdrop
          transitionDuration={300}
          data-testid="mobile-side-panel"
          sx={mobileStyle}
        >
          <DrawerContent title={title} onClose={handleClose}>
            {children}
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
