import { ReactElement } from 'react'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Typography from '@mui/material/Typography'
import { Close } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import { VideoList } from './VideoList'

export const DRAWER_WIDTH = 328

interface VideoLibraryDrawerProps {
  openDrawer: boolean
}

export function VideoLibraryDrawer({
  openDrawer
}: VideoLibraryDrawerProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return smUp ? (
    <Drawer
      anchor="right"
      variant="temporary"
      open={openDrawer}
      // onClose={toggleDrawer(false)}
      elevation={1}
      hideBackdrop
      sx={{
        display: { xs: 'none', sm: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH
        }
      }}
    >
      <VideoLibraryDrawerContent />
    </Drawer>
  ) : (
    <Drawer
      anchor="bottom"
      variant="temporary"
      open={openDrawer}
      // onClose={toggleDrawer(false)}
      hideBackdrop
      sx={{
        display: { xs: 'block', sm: 'none' }
      }}
    >
      <VideoLibraryDrawerContent />
    </Drawer>
  )
}

function VideoLibraryDrawerContent(): ReactElement {
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
            Video Library
          </Typography>
          <IconButton
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
            edge="end"
          >
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      <VideoList />
    </>
  )
}
