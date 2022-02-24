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
interface VideoLibraryDrawerContentProps {
  handleDrawerToggle: () => void
}

function VideoLibraryDrawerContent({
  handleDrawerToggle
}: VideoLibraryDrawerContentProps): ReactElement {
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
            onClick={handleDrawerToggle}
            sx={{ display: 'inline-flex' }}
            edge="end"
          >
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* search */}
      {/* language */}
      <VideoList />
    </>
  )
}
interface VideoLibraryDrawerProps {
  openDrawer: boolean
  onClose: () => void,
  onSelect: (id: string) => void
}

export function VideoLibraryDrawer({
  openDrawer,
  onClose
}: VideoLibraryDrawerProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  // should have an onSelect

  return smUp ? (
    <Drawer
      anchor="right"
      variant="temporary"
      open={openDrawer}
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
      <VideoLibraryDrawerContent handleDrawerToggle={onClose} />
    </Drawer>
  ) : (
    <Drawer
      anchor="bottom"
      variant="temporary"
      open={openDrawer}
      hideBackdrop
      sx={{
        display: { xs: 'block', sm: 'none' }
      }}
    >
      <VideoLibraryDrawerContent handleDrawerToggle={onClose} />
    </Drawer>
  )
}
