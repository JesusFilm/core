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
  title?: string | ReactNode
  sidePanelTitleAction?: ReactNode
  // TODO: Refactor to open via usePage state, combine with mobileDrawerOpen
  open?: boolean
  // TODO: Remove once admin edit page is refactored to use new PageWrapper
  edit?: boolean
  onClose?: () => void
}

interface DrawerContentProps {
  title?: string | ReactNode
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

export function SidePanel({
  children,
  title,
  open = true,
  edit = false,
  onClose
}: SidePanelProps): ReactElement {
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
        open={onClose != null ? open : true}
        hideBackdrop
        data-testid="side-drawer"
        sx={{
          display: edit
            ? { xs: 'none', sm: 'flex' }
            : { xs: 'none', md: 'flex' },
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
        <DrawerContent
          title={title}
          action={
            onClose != null && (
              <IconButton
                onClick={onClose}
                sx={{ display: 'inline-flex' }}
                edge="end"
              >
                <Close />
              </IconButton>
            )
          }
        >
          {children}
        </DrawerContent>
      </Drawer>
      {edit ? (
        <Stack sx={{ display: { xs: 'flex', sm: 'none' } }}>{children}</Stack>
      ) : (
        <Drawer
          anchor="bottom"
          variant="temporary"
          open={mobileDrawerOpen}
          hideBackdrop
          transitionDuration={300}
          data-testid="mobile-side-drawer"
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
      )}
    </>
  )
}
