import AppBar from '@mui/material/AppBar'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

import X2Icon from '@core/shared/ui/icons/X2'

import { usePage } from '../../../libs/PageWrapperProvider'
import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

interface SidePanelProps {
  children: ReactNode
  title?: ReactNode
  open?: boolean
  selectHostPanel?: boolean
  // TODO: Remove if admin edit page uses SidePanel instead of Drawer
  withAdminDrawer?: boolean
  onClose?: () => void
}

interface DrawerContentProps {
  title?: ReactNode
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
          <>
            {title != null &&
              (typeof title === 'string' ? (
                <Typography variant="subtitle1" component="div" noWrap>
                  {title}
                </Typography>
              ) : (
                title
              ))}
            {onClose != null && (
              <IconButton
                data-testid="close-side-drawer"
                onClick={onClose}
                sx={{ display: 'inline-flex' }}
                edge="end"
              >
                <X2Icon />
              </IconButton>
            )}
          </>
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
  selectHostPanel = false,
  withAdminDrawer = false,
  onClose
}: SidePanelProps): ReactElement {
  const { toolbar, sidePanel } = usePageWrapperStyles()
  const { zIndex } = useTheme()

  const {
    state: { mobileDrawerOpen },
    dispatch
  } = usePage()

  const desktopStyle = {
    display: { xs: 'none', md: 'flex' },
    width: sidePanel.width,
    flexShrink: 1,
    zIndex: selectHostPanel ? zIndex.modal : zIndex.drawer,
    '& .MuiDrawer-paper': {
      overflowX: 'hidden',
      boxSizing: 'border-box',
      width: sidePanel.width,
      height: 'calc(100% - 68px)',
      mt: 17,
      mr: 5,
      borderTopLeftRadius: { xs: 0, sm: 12 },
      borderTopRightRadius: { xs: 0, sm: 12 },
      border: '1px solid',
      borderColor: 'divider'
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
        variant="permanent"
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
