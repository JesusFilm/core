import AppBar from '@mui/material/AppBar'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog as SharedUiDialog } from '@core/shared/ui/Dialog'
import X2Icon from '@core/shared/ui/icons/X2'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockEditor } from '../ImageBlockEditor'

export const DRAWER_WIDTH = 328

interface DrawerOrDialogProps {
  children: ReactNode
  open?: boolean
  onClose?: () => void
}

function Drawer({
  children,
  open,
  onClose
}: DrawerOrDialogProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <MuiDrawer
      anchor={smUp ? 'right' : 'bottom'}
      variant="temporary"
      SlideProps={{ appear: true }}
      open={open}
      elevation={smUp ? 1 : 0}
      hideBackdrop
      sx={{
        left: {
          xs: 0,
          sm: 'unset'
        },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: smUp ? DRAWER_WIDTH : '100%',
          display: 'flex'
        }
      }}
      data-testid="ImageLibrary"
    >
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            {t('Image')}
          </Typography>
          <IconButton
            aria-label="close-image-library"
            onClick={onClose}
            sx={{ display: 'inline-flex' }}
            edge="end"
          >
            <X2Icon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {children}
    </MuiDrawer>
  )
}

function Dialog({
  children,
  open,
  onClose
}: DrawerOrDialogProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <SharedUiDialog
      open={open}
      onClose={onClose}
      dialogTitle={{ title: t('Image'), closeButton: true }}
      divider
      fullscreen={!smUp}
      sx={{
        '& .MuiDialogContent-root': {
          display: 'flex',
          flexDirection: 'column',
          p: 0
        }
      }}
    >
      {children}
    </SharedUiDialog>
  )
}
interface ImageLibraryProps {
  variant?: 'drawer' | 'dialog'
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
  variant = 'drawer',
  open,
  onClose,
  onChange,
  onDelete,
  selectedBlock,
  loading,
  showAdd,
  error
}: ImageLibraryProps): ReactElement {
  const children = (
    <ImageBlockEditor
      onChange={onChange}
      onDelete={onDelete}
      selectedBlock={selectedBlock}
      loading={loading}
      showAdd={showAdd}
      error={error}
    />
  )

  return variant === 'drawer' ? (
    <Drawer open={open} onClose={onClose}>
      {children}
    </Drawer>
  ) : (
    <Dialog open={open} onClose={onClose}>
      {children}
    </Dialog>
  )
}
