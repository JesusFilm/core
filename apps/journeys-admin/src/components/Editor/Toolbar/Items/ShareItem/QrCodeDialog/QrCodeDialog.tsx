import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { QRCodeCanvas } from 'qrcode.react'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { CodeDestination } from './CodeDestination'
import { DownloadQrCode } from './DownloadQrCode'
import { ScanCount } from './ScanCount'

interface QrCodeDialogProps {
  open: boolean
  onClose: () => void
  initialJourneyUrl?: string
}

export function QrCodeDialog({
  open,
  onClose,
  initialJourneyUrl
}: QrCodeDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [to, setTo] = useState(initialJourneyUrl ?? '')

  useEffect(() => {
    setTo(initialJourneyUrl ?? '')
  }, [initialJourneyUrl])

  function handleChangeTo(url: string): void {
    setTo(url)
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
      }}
      dialogTitle={{
        title: t('QR Code'),
        closeButton: true
      }}
    >
      <Stack
        spacing={7}
        sx={{
          overflowX: 'hidden'
        }}
      >
        <Stack
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 4, sm: 7 },
            alignItems: 'center'
          }}
        >
          <Stack
            sx={{
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1
            }}
          >
            <QRCodeCanvas
              id="qr-code-download"
              title="QR Code"
              size={122}
              level="L"
              value={to}
            />
          </Stack>
          <Stack
            spacing={3}
            sx={{
              alignItems: { xs: 'center', sm: 'start' }
            }}
          >
            <ScanCount />
            <DownloadQrCode to={to} />
            <Typography
              variant="body2"
              color="secondary.main"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              {t(
                'Here is your unique QR code that will direct people to your journey when scanned.'
              )}
            </Typography>
          </Stack>
        </Stack>
        <Divider />
        <CodeDestination to={to} handleChangeTo={handleChangeTo} />
      </Stack>
    </Dialog>
  )
}
