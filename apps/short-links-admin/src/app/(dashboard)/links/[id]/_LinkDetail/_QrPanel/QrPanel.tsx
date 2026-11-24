'use client'

import { DownloadIcon } from 'lucide-react'
import { ReactElement, useState } from 'react'

import {
  SelectField,
  SwitchField,
  TextField
} from '../../../../../../components/form'
import {
  MIN_QR_CONTRAST_RATIO,
  contrastRatio,
  hasLowQrContrast,
  isHexColor
} from '../../../../../../libs/contrast'
import {
  ERROR_CORRECTION_OPTIONS,
  QrErrorCorrection,
  ShortLinkAssetClass,
  getDefaultErrorCorrection
} from '../../../../../../libs/shortLink'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'

export interface QrImageParams {
  url: string
  format: 'png' | 'svg'
  size: number
  errorCorrectionLevel: QrErrorCorrection
  quietZone: boolean
  dark: string
  light: string
}

export function buildQrImageUrl(params: QrImageParams): string {
  const search = new URLSearchParams({
    url: params.url,
    format: params.format,
    size: String(params.size),
    ec: params.errorCorrectionLevel,
    margin: params.quietZone ? '4' : '0',
    dark: params.dark,
    light: params.light
  })
  return `/api/qr?${search.toString()}`
}

const SIZE_OPTIONS = [256, 512, 1024, 2048].map((size) => ({
  value: String(size),
  label: String(size)
}))
const DOWNLOAD_FORMATS = ['svg', 'png'] as const

interface QrPanelProps {
  qrUrl: string
  pathname: string
  assetClass: ShortLinkAssetClass
}

function ColorField({
  id,
  label,
  value,
  onChange
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}): ReactElement {
  return (
    <div className="flex items-end gap-2">
      <input
        type="color"
        aria-label={`Pick ${label.toLowerCase()}`}
        value={isHexColor(value) ? value : '#000000'}
        onChange={(event) => onChange(event.target.value)}
        className="size-8 shrink-0 cursor-pointer rounded border bg-transparent p-0"
      />
      <TextField
        id={id}
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={isHexColor(value) ? undefined : 'Enter a hex colour'}
        className="flex-1"
      />
    </div>
  )
}

export function QrPanel({
  qrUrl,
  pathname,
  assetClass
}: QrPanelProps): ReactElement {
  const [size, setSize] = useState(512)
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<QrErrorCorrection>(getDefaultErrorCorrection(assetClass))
  const [dark, setDark] = useState('#000000')
  const [light, setLight] = useState('#ffffff')
  const [quietZone, setQuietZone] = useState(true)

  const validColors = isHexColor(dark) && isHexColor(light)
  const ratio = contrastRatio(dark, light)
  const lowContrast = hasLowQrContrast(dark, light)
  const params: Omit<QrImageParams, 'format'> = {
    url: qrUrl,
    size,
    errorCorrectionLevel,
    quietZone,
    dark,
    light
  }
  const previewUrl = buildQrImageUrl({ ...params, format: 'png', size: 256 })

  return (
    <Card data-testid="QrPanel" className="w-full">
      <CardPanel className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold">QR code</h3>
          <p className="text-muted-foreground text-xs">
            Encodes {qrUrl} so scans are attributed to the QR and keep working
            when the destination changes.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3">
            {validColors ? (
              // The QR route renders on demand; next/image would add nothing.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={`QR code for ${qrUrl}`}
                width={200}
                height={200}
                className="size-50 rounded-md border"
              />
            ) : (
              <div className="size-50" />
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {DOWNLOAD_FORMATS.map((format) => (
                <Button
                  key={format}
                  variant={format === 'svg' ? 'default' : 'outline'}
                  render={
                    <a
                      href={buildQrImageUrl({ ...params, format })}
                      download={`${pathname}.${format}`}
                    />
                  }
                  disabled={!validColors}
                >
                  <DownloadIcon aria-hidden="true" />
                  Download {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:col-span-2 md:grid-cols-3">
            <SelectField
              id="qr-size"
              label="Size (px)"
              value={String(size)}
              onValueChange={(value) => setSize(Number(value))}
              options={SIZE_OPTIONS}
            />
            <SelectField
              id="qr-ec"
              label="Error correction"
              value={errorCorrectionLevel}
              onValueChange={(value) =>
                setErrorCorrectionLevel(value as QrErrorCorrection)
              }
              options={ERROR_CORRECTION_OPTIONS}
              helperText={
                assetClass === 'videoEmbedded'
                  ? 'H recommended for video-embedded links'
                  : undefined
              }
            />
            <ColorField
              id="qr-dark"
              label="Dark colour"
              value={dark}
              onChange={setDark}
            />
            <ColorField
              id="qr-light"
              label="Light colour"
              value={light}
              onChange={setLight}
            />
            <SwitchField
              id="qr-quiet-zone"
              label="Quiet zone"
              checked={quietZone}
              onCheckedChange={setQuietZone}
            />
            <div className="sm:col-span-2 md:col-span-3">
              {lowContrast ? (
                <Alert variant="warning">
                  <AlertDescription>
                    Contrast is {ratio?.toFixed(2)}:1. Scanners need at least{' '}
                    {MIN_QR_CONTRAST_RATIO}:1 between the dark and light
                    colours.
                  </AlertDescription>
                </Alert>
              ) : (
                ratio != null && (
                  <p className="text-muted-foreground text-xs">
                    Contrast {ratio.toFixed(2)}:1
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      </CardPanel>
    </Card>
  )
}
