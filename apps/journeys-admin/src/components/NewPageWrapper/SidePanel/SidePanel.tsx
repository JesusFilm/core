import { ReactElement, ReactNode } from 'react'
import AppBar from '@mui/material/AppBar'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Close from '@mui/icons-material/Close'
import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'
import { usePage } from '../../../libs/PageWrapperProvider'

interface SidePanelProps {
  children: ReactNode
  title?: string
}

interface DrawerContentProps {
  title?: string
  children: ReactNode
  action?: ReactNode
}

function DrawerContent({
  title,
  children,
  action
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
          {action}
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

export function SidePanel({ children, title }: SidePanelProps): ReactElement {
  const { toolbar, sidePanel } = usePageWrapperStyles()
  const {
    state: { mobileDrawerOpen },
    dispatch
  } = usePage()

  const handleClose = (): void => {
    dispatch({
      type: 'SetMobileDrawerOpenAction',
      mobileDrawerOpen: false
    })
  }

  return (
    <>
      <Drawer
        anchor="right"
        variant="persistent"
        open
        hideBackdrop
        data-testId="side-drawer"
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: sidePanel.width,
          flexShrink: 1,
          '& .MuiDrawer-paper': {
            overflowX: 'hidden',
            boxSizing: 'border-box',
            width: sidePanel.width,
            height: '100%'
          }
        }}
      >
        <DrawerContent title={title}>{children}</DrawerContent>
      </Drawer>
      <Drawer
        anchor="bottom"
        variant="temporary"
        open={mobileDrawerOpen}
        hideBackdrop
        transitionDuration={300}
        data-testId="mobile-side-drawer"
        sx={{
          display: { xs: 'flex', md: 'none' },
          width: '100%',
          flexShrink: 1,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: '100%',
            height: `calc(100% - ${toolbar.height}px)`
          }
        }}
      >
        <DrawerContent
          title={title}
          action={
            <IconButton
              onClick={handleClose}
              sx={{ display: 'inline-flex' }}
              edge="end"
            >
              <Close />
            </IconButton>
          }
        >
          {children}
        </DrawerContent>
      </Drawer>
    </>
  )
}
