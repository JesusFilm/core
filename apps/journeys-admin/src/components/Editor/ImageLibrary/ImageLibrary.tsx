import { ReactElement } from 'react'
import AppBar from '@mui/material/AppBar'
import Close from '@mui/icons-material/Close'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { object, string } from 'yup'
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
  noSource?: boolean
}

export function ImageLibrary({
  open,
  onClose,
  onChange,
  onDelete,
  selectedBlock,
  loading,
  noSource = false
}: ImageLibraryProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  const srcSchema = object().shape({
    src: string().url('Please enter a valid url').required('Required')
  })

  const handleSrcChange = async (src: string): Promise<void> => {
    if (!(await srcSchema.isValid({ src })) || src === selectedBlock?.src)
      return

    const block = {
      ...selectedBlock,
      src,
      alt: src.replace(/(.*\/)*/, '').replace(/\?.*/, '') // per Vlad 26/1/22, we are hardcoding the image alt for now
    }
    await onChange(block as ImageBlock)
  }

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
            onClick={onClose}
            sx={{ display: 'inline-flex' }}
            edge="end"
          >
            <Close sx={{ display: { xs: 'block', sm: 'none' } }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <ImageBlockEditor
        onChange={handleSrcChange}
        onDelete={onDelete}
        selectedBlock={selectedBlock}
        loading={loading}
        noSource={noSource}
      />
    </Drawer>
  )
}
