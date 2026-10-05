import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { QRCodeCanvas } from 'qrcode.react'
import { ReactElement, Ref } from 'react'

import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'

/** The side, in pixels, of every downloaded QR PNG, whatever size the canvas shows at. */
export const QR_CODE_PNG_SIZE = 1024

interface QrCodeCanvasProps {
  /** The URL the code encodes: a short link. Nothing is drawn without one. */
  value?: string
  loading?: boolean
  /** The size the code is shown at, in pixels; the bitmap is always `QR_CODE_PNG_SIZE`. */
  size?: number
  /** The DOM id a download reads the canvas back by. */
  id?: string
  /** The canvas, for a download that reads it back. */
  canvasRef?: Ref<HTMLCanvasElement>
}

/**
 * The PNG of a drawn QR canvas at `QR_CODE_PNG_SIZE` square: the canvas's
 * own bitmap when it already is that size, else a copy drawn at that size
 * (the bitmap is `size × devicePixelRatio`, so a high-density screen draws
 * larger); without a 2D context the bitmap is used as drawn.
 */
export function qrCodePngDataUrl(canvas: HTMLCanvasElement): string {
  if (canvas.width === QR_CODE_PNG_SIZE) return canvas.toDataURL('image/png')
  const target = canvas.ownerDocument.createElement('canvas')
  target.width = QR_CODE_PNG_SIZE
  target.height = QR_CODE_PNG_SIZE
  const context = target.getContext('2d')
  if (context == null) return canvas.toDataURL('image/png')
  context.drawImage(canvas, 0, 0, QR_CODE_PNG_SIZE, QR_CODE_PNG_SIZE)
  return target.toDataURL('image/png')
}

/** Save the drawn QR canvas as a PNG named `fileName`, through a transient download link. */
export function downloadQrCodePng(
  canvas: HTMLCanvasElement,
  fileName: string
): void {
  const link = canvas.ownerDocument.createElement('a')
  link.href = qrCodePngDataUrl(canvas)
  link.download = fileName
  canvas.ownerDocument.body.appendChild(link)
  link.click()
  link.remove()
}

/**
 * A QR code of `value` drawn in the browser: error-correction level M, black
 * on white always (printed and projected codes must scan whatever the page's
 * colours), at `QR_CODE_PNG_SIZE` so a download is a crisp 1024 px PNG
 * however small the code is shown. Shared by the admin QR dialog and the
 * public campaign Share section. A skeleton while loading, an empty tile
 * without a value.
 */
export function QrCodeCanvas({
  value,
  loading = false,
  size = 174,
  id,
  canvasRef
}: QrCodeCanvasProps): ReactElement {
  const showQrCode = value != null && !loading
  const showEmpty = value == null && !loading
  const tileSize = size + 12

  return (
    <>
      {showQrCode && (
        <Stack
          data-testid="QrCodeCanvas"
          sx={{
            borderWidth: '2px',
            borderStyle: 'solid',
            borderRadius: 2,
            borderColor: 'divider',
            backgroundColor: '#FFFFFF',
            p: 1,
            width: 'fit-content'
          }}
        >
          <QRCodeCanvas
            ref={canvasRef}
            id={id}
            title="QR Code"
            size={QR_CODE_PNG_SIZE}
            level="M"
            fgColor="#000000"
            bgColor="#FFFFFF"
            value={value}
            aria-label={value}
            style={{ width: size, height: size }}
          />
        </Stack>
      )}
      {showEmpty && (
        <Box
          sx={{
            minHeight: tileSize,
            minWidth: tileSize,
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
          sx={{ borderRadius: 2, minHeight: tileSize, minWidth: tileSize }}
        />
      )}
    </>
  )
}
