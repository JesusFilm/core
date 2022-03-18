import { ReactElement, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Typography from '@mui/material/Typography'
import { Close } from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import { VideoList } from './VideoList'
import { VideoSearch } from './VideoSearch'

export const DRAWER_WIDTH = 328
interface VideoLibraryProps {
  open: boolean
  onClose?: () => void
  onSelect?: (source: string) => void
}

export function VideoLibrary({
  open,
  onClose,
  onSelect: handleSelect
}: VideoLibraryProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [title, setTitle] = useState<string>()

  const onSelect = (source: string): void => {
    if (handleSelect != null) handleSelect(source)
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
      <VideoSearch title={title} setTitle={setTitle} />
      {/* language */}
      {/* currentLanguageIds value is temporary */}
      <VideoList
        onSelect={onSelect}
        currentLanguageIds={['529']}
        title={title}
      />
    </Drawer>
  )
}
