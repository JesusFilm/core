import { ReactElement, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Typography from '@mui/material/Typography'
import { Close } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Button from '@mui/material/Button'
import SubscriptionsRounded from '@mui/icons-material/SubscriptionsRounded'
import { VideoList } from './VideoList'

export const DRAWER_WIDTH = 328
interface VideoLibraryContentProps {
  handleLibraryToggle: () => void
}

function VideoLibraryContent({
  handleLibraryToggle
}: VideoLibraryContentProps): ReactElement {
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
      <VideoList />
    </>
  )
}
interface VideoLibraryProps {
  onSelect: (id: string) => void
}

export function VideoLibrary({
  onSelect
}: VideoLibraryProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const handleLibraryToggle = (): void => {
    setOpen(!open)
  }

  // should have an onSelect
  // so we are trying to get the selected videos id
  // to make sure we're changing the right video

  return <>
    <Button
      variant="text"
      startIcon={<SubscriptionsRounded />}
      size="small"
      onClick={() => setOpen(true)}
      sx={{ px: 2 }}
    >
      Select a Video
    </Button>
    {
      smUp ? (
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
          <VideoLibraryContent handleLibraryToggle={handleLibraryToggle} />
        </Drawer>
      ) : (
        <Drawer
          anchor="bottom"
          variant="temporary"
          open={open}
          hideBackdrop
          sx={{
            display: { xs: 'block', sm: 'none' }
          }}
        >
          <VideoLibraryContent handleLibraryToggle={handleLibraryToggle} />
        </Drawer>
      )
    }
  </>
}
