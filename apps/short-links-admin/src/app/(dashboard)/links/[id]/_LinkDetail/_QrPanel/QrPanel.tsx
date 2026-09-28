'use client'

import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { withBasePath } from '../../../../../../libs/basePath'
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
  return withBasePath(`/api/qr?${search.toString()}`)
}

const SIZE_OPTIONS = [256, 512, 1024, 2048]

interface QrPanelProps {
  qrUrl: string
  pathname: string
  assetClass: ShortLinkAssetClass
}

export function QrPanel({
  qrUrl,
  pathname,
  assetClass
}: QrPanelProps): ReactElement {
  const [size, setSize] = useState(512)
  const [format, setFormat] = useState<'png' | 'svg'>('png')
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<QrErrorCorrection>(getDefaultErrorCorrection(assetClass))
  const [dark, setDark] = useState('#000000')
  const [light, setLight] = useState('#ffffff')
  const [quietZone, setQuietZone] = useState(true)

  const validColors = isHexColor(dark) && isHexColor(light)
  const ratio = contrastRatio(dark, light)
  const lowContrast = hasLowQrContrast(dark, light)
  const params: QrImageParams = {
    url: qrUrl,
    format,
    size,
    errorCorrectionLevel,
    quietZone,
    dark,
    light
  }
  const downloadUrl = buildQrImageUrl(params)
  const previewUrl = buildQrImageUrl({ ...params, format: 'png', size: 256 })

  return (
    <Paper sx={{ p: 2, width: '100%' }} data-testid="QrPanel">
      <Typography component="h3" variant="h6" sx={{ mb: 0.5 }}>
        QR code
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', mb: 2 }}
      >
        Encodes {qrUrl} so scans are attributed to the QR and keep working when
        the destination changes.
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack sx={{ alignItems: 'center' }} spacing={1}>
            {validColors ? (
              <Box
                component="img"
                src={previewUrl}
                alt={`QR code for ${qrUrl}`}
                sx={{
                  width: 200,
                  height: 200,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              />
            ) : (
              <Box sx={{ width: 200, height: 200 }} />
            )}
            <Button
              component="a"
              href={downloadUrl}
              download={`${pathname}.${format}`}
              variant="contained"
              startIcon={<DownloadRoundedIcon />}
              disabled={!validColors}
            >
              Download {format.toUpperCase()}
            </Button>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Size (px)"
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
              >
                {SIZE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Format"
                value={format}
                onChange={(event) =>
                  setFormat(event.target.value as 'png' | 'svg')
                }
              >
                <MenuItem value="png">PNG</MenuItem>
                <MenuItem value="svg">SVG</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Error correction"
                value={errorCorrectionLevel}
                onChange={(event) =>
                  setErrorCorrectionLevel(
                    event.target.value as QrErrorCorrection
                  )
                }
                helperText={
                  assetClass === 'videoEmbedded'
                    ? 'H recommended for video-embedded links'
                    : undefined
                }
              >
                {ERROR_CORRECTION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Dark colour"
                value={dark}
                onChange={(event) => setDark(event.target.value)}
                error={!isHexColor(dark)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box
                        component="input"
                        type="color"
                        aria-label="Pick dark colour"
                        value={isHexColor(dark) ? dark : '#000000'}
                        onChange={(event) => setDark(event.target.value)}
                        sx={{ width: 28, height: 28, mr: 1, border: 0, p: 0 }}
                      />
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Light colour"
                value={light}
                onChange={(event) => setLight(event.target.value)}
                error={!isHexColor(light)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Box
                        component="input"
                        type="color"
                        aria-label="Pick light colour"
                        value={isHexColor(light) ? light : '#ffffff'}
                        onChange={(event) => setLight(event.target.value)}
                        sx={{ width: 28, height: 28, mr: 1, border: 0, p: 0 }}
                      />
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={quietZone}
                    onChange={(event) => setQuietZone(event.target.checked)}
                  />
                }
                label="Quiet zone"
              />
            </Grid>
            <Grid size={12}>
              {lowContrast ? (
                <Alert severity="warning">
                  Contrast is {ratio?.toFixed(2)}:1. Scanners need at least{' '}
                  {MIN_QR_CONTRAST_RATIO}:1 between the dark and light colours.
                </Alert>
              ) : (
                ratio != null && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    Contrast {ratio.toFixed(2)}:1
                  </Typography>
                )
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}
