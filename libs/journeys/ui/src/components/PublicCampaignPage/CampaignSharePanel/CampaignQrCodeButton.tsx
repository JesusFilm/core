import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next/pages'
import { QRCodeCanvas } from 'qrcode.react'
import { ReactElement, useId, useState } from 'react'

import DownloadIcon from '@core/shared/ui/icons/Download2'

interface CampaignQrCodeButtonProps {
  /** Link encoded in the QR code; empty disables the button. */
  value: string
  /** File name (without extension) of the downloaded PNG. */
  fileName: string
  decorative?: boolean
}

/**
 * Renders an off-screen QR canvas for `value` and a button that downloads it
 * as a PNG — the same canvas→data-URL approach as the admin QR dialog, without
 * the short-link indirection (campaign share links are the public journey URL).
 */
export function CampaignQrCodeButton({
  value,
  fileName,
  decorative = false
}: CampaignQrCodeButtonProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const canvasId = useId()
  const [error, setError] = useState(false)
  const disabled = decorative || value === ''

  function handleDownload(): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
    if (canvas == null) return
    try {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream')
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = `${fileName}-qr-code.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setError(false)
    } catch {
      setError(true)
    }
  }

  return (
    <Box>
      {!disabled && (
        <Box sx={{ display: 'none' }} aria-hidden="true">
          <QRCodeCanvas
            id={canvasId}
            value={value}
            size={512}
            level="M"
            marginSize={2}
          />
        </Box>
      )}
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
        disabled={disabled}
        data-testid="CampaignQrCodeButton"
      >
        {t('Download a QR code')}
      </Button>
      {error && (
        <Box
          component="span"
          sx={{ display: 'block', mt: 1, color: 'error.main' }}
        >
          {t('Something went wrong creating the QR code. Please try again.')}
        </Box>
      )}
    </Box>
  )
}
