import { ReactElement, ReactNode } from 'react'
import AppBar from '@mui/material/AppBar'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { Close } from '@mui/icons-material'
import { useEditor } from '@core/journeys/ui'

export const DRAWER_WIDTH = 328

interface DrawerContentProps {
  title?: string
  children?: ReactNode
  handleDrawerToggle: () => void
}

function DrawerContent({
  title,
  children,
  handleDrawerToggle
}: DrawerContentProps): ReactElement {
  return (
    <>
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            {title}
          </Typography>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            edge="end"
          >
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      {children}
    </>
  )
}

export function Drawer(): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    state: {
      drawerTitle: title,
      drawerChildren: children,
      drawerMobileOpen: mobileOpen
    },
    dispatch
  } = useEditor()

  const handleDrawerToggle = (): void => {
    dispatch({
      type: 'SetDrawerMobileOpenAction',
      mobileOpen: !mobileOpen
    })
  }

  return smUp ? (
    <MuiDrawer
      anchor="right"
      variant="permanent"
      sx={{
        display: { xs: 'none', sm: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH
        }
      }}
      ModalProps={{
        keepMounted: true
      }}
      open
    >
      <DrawerContent title={title} handleDrawerToggle={handleDrawerToggle}>
        {children}
      </DrawerContent>
    </MuiDrawer>
  ) : (
    <>
      <MuiDrawer
        anchor="bottom"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'none' }
        }}
      >
        <DrawerContent title={title} handleDrawerToggle={handleDrawerToggle}>
          {children}
        </DrawerContent>
      </MuiDrawer>
    </>
  )
}
