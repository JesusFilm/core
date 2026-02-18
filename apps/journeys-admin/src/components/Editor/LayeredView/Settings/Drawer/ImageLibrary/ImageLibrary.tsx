import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'

import { Dialog as SharedUiDialog } from '@core/shared/ui/Dialog'

import { DrawerTitle } from '..'
import { DRAWER_WIDTH } from '../../../../constants'
import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../__generated__/globalTypes'
import { ImageBlockEditor } from '../ImageBlockEditor'

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
  onChange: (image: ImageBlockUpdateInput) => Promise<void>
  onDelete?: () => Promise<void>
  selectedBlock?: ImageBlock | null
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
    <>
      {open && (
        <Stack
          component={Paper}
          elevation={0}
          sx={{
            position: 'fixed',
            top: 0,
            right: 16,
            bottom: 0,
            width: DRAWER_WIDTH,
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}
          border={1}
          borderColor="divider"
          data-testid="SettingsDrawer"
        >
          <DrawerTitle title={t('Image')} onClose={onClose} />
          <Stack
            data-testid="SettingsDrawerContent"
            className="swiper-no-swiping"
            flexGrow={1}
            sx={{ overflow: 'auto', mb: { md: 4 } }}
          >
            {children}
          </Stack>
        </Stack>
      )}
    </>
  ) : (
    <Dialog open={open} onClose={onClose}>
      {children}
    </Dialog>
  )
}
