import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { QRCodeCanvas } from 'qrcode.react'
import { ReactElement } from 'react'

import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'

interface CodeCanvasProps {
  shortLink?: string
  loading: boolean
}

export function CodeCanvas({
  shortLink,
  loading
}: CodeCanvasProps): ReactElement {
  const showQrCode = shortLink != null && !loading
  const showEmpty = shortLink == null && !loading

  return (
    <>
      {showQrCode && (
        <Stack
          sx={{
            borderWidth: '2px',
            borderStyle: 'solid',
            borderRadius: 2,
            borderColor: 'divider',
            p: 1
          }}
        >
          <QRCodeCanvas
            id="qr-code-download"
            title="QR Code"
            size={174}
            level="L"
            value={shortLink}
            aria-label={shortLink}
          />
        </Stack>
      )}
      {showEmpty && (
        <Box
          sx={{
            minHeight: 186,
            minWidth: 186,
            backgroundColor: 'divider',
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <GridEmptyIcon />
        </Box>
      )}
      {loading && (
        <Skeleton
          variant="rectangular"
          aria-label="Loading QR code"
          sx={{ borderRadius: 2, minHeight: 186, minWidth: 186 }}
        />
      )}
    </>
  )
}
