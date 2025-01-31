import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import Clock1 from '@core/shared/ui/icons/Clock1'

import { QrCodeFields as QrCode } from '../../../../../../../../__generated__/QrCodeFields'

interface RedirectDialogProps {
  open: boolean
  onClose: () => void
  qrCode: QrCode
  to: string
  handleUndo: () => Promise<void>
}

export function RedirectDialog({
  open,
  onClose,
  qrCode,
  to,
  handleUndo
}: RedirectDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  function handleRedirectClick(): void {
    window.open(`${window.origin}/journeys/${qrCode.toJourneyId}`, '_blank')
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
      }}
      dialogTitle={{
        title: t('The QR code was redirected to:'),
        closeButton: true
      }}
    >
      <Stack
        spacing={4}
        sx={{
          overflowX: 'hidden'
        }}
      >
        <TextField
          variant="filled"
          hiddenLabel
          value={to}
          slotProps={{
            input: {
              readOnly: true
            }
          }}
          onMouseDown={(e) => e.preventDefault()}
        />
        <Stack
          direction="row"
          spacing={3}
          alignItems="center"
          sx={{
            py: 3,
            px: 4,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Clock1 />
          <Typography variant="body2" color="secondary.dark">
            {t(
              "It may take a few minutes for the QR code update to show up where it's being used."
            )}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" justifyContent="flex-end" sx={{ pt: 6 }}>
        <Stack direction="row" spacing={3}>
          <Button
            variant="outlined"
            color="secondary"
            size="medium"
            onClick={() => {
              void handleUndo()
              onClose()
            }}
          >
            {t('Undo changes')}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="medium"
            onClick={handleRedirectClick}
          >
            {t('Go to this journey')}
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  )
}
