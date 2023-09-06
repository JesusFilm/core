import AppBar from '@mui/material/AppBar'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import X2 from '@core/shared/ui/icons/X2'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockEditor } from '../ImageBlockEditor'

export const DRAWER_WIDTH = 328

interface ImageLibraryProps {
  open: boolean
  onClose?: () => void
  onChange: (image: ImageBlock) => Promise<void>
  onDelete?: () => Promise<void>
  selectedBlock: ImageBlock | null
  loading?: boolean
  showAdd?: boolean
  error?: boolean
}

export function ImageLibrary({
  open,
  onClose,
  onChange,
  onDelete,
  selectedBlock,
  loading,
  showAdd,
  error
}: ImageLibraryProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <Drawer
      anchor={smUp ? 'right' : 'bottom'}
      variant="temporary"
      open={open}
      hideBackdrop
      elevation={smUp ? 1 : 0}
      sx={{
        left: {
          xs: 0,
          sm: 'unset'
        },
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
            Image
          </Typography>
          <IconButton
            aria-label="close-image-library"
            onClick={onClose}
            sx={{ display: 'inline-flex' }}
            edge="end"
          >
            <X2 />
          </IconButton>
        </Toolbar>
      </AppBar>
      <ImageBlockEditor
        onChange={onChange}
        onDelete={onDelete}
        selectedBlock={selectedBlock}
        loading={loading}
        showAdd={showAdd}
        error={error}
      />
    </Drawer>
  )
}
