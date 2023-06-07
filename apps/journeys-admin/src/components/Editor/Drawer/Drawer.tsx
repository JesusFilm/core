import { ReactElement, ReactNode } from 'react'
import AppBar from '@mui/material/AppBar'
import MuiDrawer from '@mui/material/Drawer'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import Close from '@mui/icons-material/Close'
import { useEditor } from '@core/journeys/ui/EditorProvider'

export const DRAWER_WIDTH = 328

interface DrawerContentProps {
  title?: string
  children?: ReactNode
  handleDrawerToggle?: () => void
}

export function DrawerContent({
  title,
  children,
  handleDrawerToggle
}: DrawerContentProps): ReactElement {
  return (
    <>
      <DrawerTitle title={title} handleDrawerToggle={handleDrawerToggle} />
      {children}
    </>
  )
}

export function DrawerTitle({ title, handleDrawerToggle }): ReactElement {
  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Typography
          variant="subtitle1"
          noWrap
          component="div"
          sx={{ flexGrow: 1 }}
          data-testid="drawer-title"
        >
          {title}
        </Typography>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{ display: { xs: 'inline-flex', sm: 'inline-flex', md: 'none' } }}
          edge="end"
        >
          <Close />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export function Drawer(): ReactElement {
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
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

  return mdUp ? (
    <Paper
      elevation={0}
      sx={{
        display: { xs: 'none', sm: 'block' },
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: '328px',
        borderLeft: 1,
        borderColor: 'divider',
        borderRadius: 0,
        overflow: 'hidden'
      }}
    >
      <DrawerContent title={title} handleDrawerToggle={handleDrawerToggle}>
        {children}
      </DrawerContent>
    </Paper>
  ) : (
    <>
      <MuiDrawer
        anchor="bottom"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', sm: 'block' }
        }}
      >
        <DrawerContent title={title} handleDrawerToggle={handleDrawerToggle}>
          {children}
        </DrawerContent>
      </MuiDrawer>
    </>
  )
}
