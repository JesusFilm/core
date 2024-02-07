import AppBar from '@mui/material/AppBar'
import MuiDrawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { Theme, useTheme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Dialog as SharedUiDialog } from '@core/shared/ui/Dialog'
import X2Icon from '@core/shared/ui/icons/X2'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'
import { ImageBlockEditor } from '../ImageBlockEditor'
import { Drawer } from '../Drawer'

interface DialogProps {
  children: ReactNode
  open?: boolean
  onClose?: () => void
}

function Dialog({ children, open, onClose }: DialogProps): ReactElement {
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
  const { t } = useTranslation('apps-journeys-admin')
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
    <Drawer title={t('Image')} open={open} onClose={onClose}>
      {children}
    </Drawer>
  ) : (
    <Dialog open={open} onClose={onClose}>
      {children}
    </Dialog>
  )
}
