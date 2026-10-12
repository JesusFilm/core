import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { QRCodeCanvas } from 'qrcode.react'
import { ReactElement } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'

/** The side, in pixels, of every downloaded QR PNG, whatever size the canvas shows at. */
export const QR_CODE_PNG_SIZE = 1024

interface QrCodeCanvasProps {
  /** The URL the code encodes: a short link. Nothing is drawn without one. */
  value?: string
  loading?: boolean
  /** The size the code is shown at, in pixels; a download is always `QR_CODE_PNG_SIZE`. */
  size?: number
  /** The DOM id of the canvas. */
  id?: string
}

const QR_CODE_LEVEL = 'M'
const QR_CODE_FOREGROUND = '#000000'
const QR_CODE_BACKGROUND = '#FFFFFF'

/**
 * The PNG data URL of `value` as a `QR_CODE_PNG_SIZE` square, drawn off-screen
 * on demand so the canvases on the page stay at their display size. The
 * off-screen bitmap is `QR_CODE_PNG_SIZE × devicePixelRatio` (qrcode.react
 * scales by it), so it is copied down to exactly `QR_CODE_PNG_SIZE`; without
 * a 2D context the bitmap is used as drawn.
 */
export function qrCodePngDataUrl(value: string): string | undefined {
  const container = document.createElement('div')
  const root = createRoot(container)
  flushSync(() =>
    root.render(
      <QRCodeCanvas
        value={value}
        size={QR_CODE_PNG_SIZE}
        level={QR_CODE_LEVEL}
        fgColor={QR_CODE_FOREGROUND}
        bgColor={QR_CODE_BACKGROUND}
      />
    )
  )
  const canvas = container.querySelector('canvas')
  const dataUrl = canvas == null ? undefined : pngDataUrlAtSize(canvas)
  flushSync(() => root.unmount())
  return dataUrl
}

function pngDataUrlAtSize(canvas: HTMLCanvasElement): string {
  if (canvas.width === QR_CODE_PNG_SIZE) return canvas.toDataURL('image/png')
  const target = canvas.ownerDocument.createElement('canvas')
  target.width = QR_CODE_PNG_SIZE
  target.height = QR_CODE_PNG_SIZE
  const context = target.getContext('2d')
  if (context == null) return canvas.toDataURL('image/png')
  context.drawImage(canvas, 0, 0, QR_CODE_PNG_SIZE, QR_CODE_PNG_SIZE)
  return target.toDataURL('image/png')
}

/** Save the QR code of `value` as a `QR_CODE_PNG_SIZE` PNG named `fileName`, through a transient download link. */
export function downloadQrCodePng(value: string, fileName: string): void {
  const href = qrCodePngDataUrl(value)
  if (href == null) return
  const link = document.createElement('a')
  link.href = href
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
}

/**
 * A QR code of `value` drawn in the browser: error-correction level M, black
 * on white always (printed and projected codes must scan whatever the page's
 * colours), drawn at the size it is shown; a download draws its own
 * crisp 1024 px PNG off-screen (`downloadQrCodePng`). Shared by the admin QR dialog and the
 * public campaign Share section. A skeleton while loading, an empty tile
 * without a value.
 */
export function QrCodeCanvas({
  value,
  loading = false,
  size = 174,
  id
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
            id={id}
            title="QR Code"
            size={size}
            level={QR_CODE_LEVEL}
            fgColor={QR_CODE_FOREGROUND}
            bgColor={QR_CODE_BACKGROUND}
            value={value}
            aria-label={value}
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
