import { ReactElement, useContext, useState } from 'react'
import { AppBar, Drawer as MuiDrawer, Toolbar, Typography } from '@mui/material'
import { EditorContext } from '../Context'

export const DRAWER_WIDTH = 328

export function Drawer(): ReactElement {
  const [mobileOpen, setMobileOpen] = useState(false)
  const {
    state: { drawerTitle, drawerChildren }
  } = useContext(EditorContext)

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <>
      <MuiDrawer
        anchor="bottom"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' }
        }}
      >
        {drawerChildren}
      </MuiDrawer>
      <MuiDrawer
        anchor="right"
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH }
        }}
        open
      >
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {drawerTitle}
            </Typography>
          </Toolbar>
        </AppBar>
        {drawerChildren}
      </MuiDrawer>
    </>
  )
}
