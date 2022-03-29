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
interface VideoLibraryProps {
  open: boolean
  onClose?: () => void
  onSelect?: (videoId: string, videoVariantLanguageId?: string) => void
}

export function VideoLibrary({
  open,
  onClose,
  onSelect: handleSelect
}: VideoLibraryProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const onSelect = (videoId: string, videoVariantLanguageId?: string): void => {
    if (handleSelect != null) handleSelect(videoId, videoVariantLanguageId)
    if (onClose != null) onClose()
  }

  return (
    <Drawer
      anchor={smUp ? 'right' : 'bottom'}
      variant="temporary"
      open={open}
      elevation={smUp ? 1 : 0}
      hideBackdrop
      sx={{
        display: { xs: smUp ? 'none' : 'block', sm: smUp ? 'block' : 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: smUp ? DRAWER_WIDTH : '100%',
          height: '100%'
        }
      }}
    >
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
            onClick={onClose}
            sx={{ display: 'inline-flex' }}
            edge="end"
          >
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* search */}
      {/* language */}
      {/* currentLanguageIds value is temporary */}
      <VideoList onSelect={onSelect} currentLanguageIds={['529']} />
    </Drawer>
  )
}
