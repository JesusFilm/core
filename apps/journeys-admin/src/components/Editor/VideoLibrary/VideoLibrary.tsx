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
interface VideoLibraryContentProps {
  handleLibraryToggle: () => void
  onSelect: (id: string) => void
}

function VideoLibraryContent({
  handleLibraryToggle,
  onSelect
}: VideoLibraryContentProps): ReactElement {
  // should we make the appbar it's own component that accepts a title prop?
  // this "drawer header" code is going to be repeated three times
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
            onClick={handleLibraryToggle}
            sx={{ display: 'inline-flex' }}
            edge="end"
          >
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* search */}
      {/* language */}
      <VideoList onSelect={onSelect} />
    </>
  )
}
interface VideoLibraryProps {
  open: boolean
  onClose: () => void
  onSelect: (id: string) => void
}

export function VideoLibrary({
  open,
  onClose,
  onSelect
}: VideoLibraryProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  // onSelectReturns the chosen videos ID

  return (
    <>
      {smUp ? (
        <Drawer
          anchor="right"
          variant="temporary"
          open={open}
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
          <VideoLibraryContent
            handleLibraryToggle={onClose}
            onSelect={onSelect}
          />
        </Drawer>
      ) : (
        <Drawer
          anchor="bottom"
          variant="temporary"
          open={open}
          hideBackdrop
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              height: '100%'
            }
          }}
        >
          <VideoLibraryContent
            handleLibraryToggle={onClose}
            onSelect={onSelect}
          />
        </Drawer>
      )}
    </>
  )
}
