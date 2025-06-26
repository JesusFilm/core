import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { ThemePreview } from './ThemePreview'
import { ThemeSettings } from './ThemeSettings'

interface ThemeBuilderDialogProps {
  open: boolean
  onClose: () => void
}

export function ThemeBuilderDialog({
  open,
  onClose
}: ThemeBuilderDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [headerFont, setHeaderFont] = useState<string>('Arial')
  const [bodyFont, setBodyFont] = useState('Helvetica')
  const [labelsFont, setLabelsFont] = useState('Roboto')

  const handleHeaderFontChange = (font: string): void => {
    setHeaderFont(font)
  }

  const handleBodyFontChange = (font: string): void => {
    setBodyFont(font)
  }

  const handleLabelsFontChange = (font: string): void => {
    setLabelsFont(font)
  }

  const dialogActionChildren = (
    <Stack direction="row" justifyContent="space-between" width="100%">
      <Button variant="outlined" color="secondary" onClick={onClose}>
        {t('Cancel')}
      </Button>
      <Button variant="contained" color="primary" onClick={onClose}>
        {t('Confirm')}
      </Button>
    </Stack>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          minWidth: '856px',
          minHeight: '860px'
        }
      }}
      dialogTitle={{
        title: t('Select Fonts'),
        closeButton: true
      }}
      dialogActionChildren={dialogActionChildren}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{
          width: '100%',
          height: '100%'
        }}
      >
        <ThemeSettings
          headerFont={headerFont}
          bodyFont={bodyFont}
          labelsFont={labelsFont}
          onHeaderFontChange={handleHeaderFontChange}
          onBodyFontChange={handleBodyFontChange}
          onLabelsFontChange={handleLabelsFontChange}
        />
        <ThemePreview
          headerFont={headerFont}
          bodyFont={bodyFont}
          labelsFont={labelsFont}
        />
      </Stack>
    </Dialog>
  )
}
