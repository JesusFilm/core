'use client'

import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ReplayIcon from '@mui/icons-material/Replay'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { useCallback } from 'react'

type VideoVariantUploadStatus =
  | 'created'
  | 'r2Prepared'
  | 'r2Uploaded'
  | 'muxCreated'
  | 'muxReady'
  | 'variantCreated'
  | 'failed'

export interface VideoVariantUploadRow {
  id: string
  source: string
  sourceKey?: string | null
  status: VideoVariantUploadStatus
  videoId: string
  languageId: string
  language?: {
    id: string
    name?: Array<{ value?: string | null }> | null
  } | null
  edition: string
  originalFilename?: string | null
  contentType?: string | null
  contentLength?: string | number | null
  errorMessage?: string | null
  r2AssetId?: string | null
  muxVideoId?: string | null
  muxNonStandardInputDetectedAt?: string | null
  videoVariantId?: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

export const incompleteUploadStatuses: VideoVariantUploadStatus[] = [
  'created',
  'r2Prepared',
  'r2Uploaded',
  'muxCreated',
  'muxReady',
  'failed'
]

const STANDARD_MUX_PROCESSING_STALE_MS = 30 * 60 * 1000
const NON_STANDARD_MUX_PROCESSING_STALE_MS = 2 * 60 * 60 * 1000

interface IncompleteUploadDisplayState {
  label: string
  color: 'error' | 'info' | 'warning'
  message: string | null
  processingDurationLabel: string | null
  action: 'addAgain' | 'resume' | null
  actionLabel: string | null
}

interface IncompleteVideoVariantUploadItemsProps {
  uploads: VideoVariantUploadRow[]
  resumingUploadId: string | null
  isResumeRequestInFlight: boolean
  onAddAudioLanguage: () => void
  onResumeUpload: (uploadId: string) => void
}

function getMuxProcessingStaleMs(upload: VideoVariantUploadRow): number {
  return upload.muxNonStandardInputDetectedAt == null
    ? STANDARD_MUX_PROCESSING_STALE_MS
    : NON_STANDARD_MUX_PROCESSING_STALE_MS
}

function getMuxProcessingStaleMessage(upload: VideoVariantUploadRow): string {
  const staleHours = getMuxProcessingStaleMs(upload) / (60 * 60 * 1000)

  if (staleHours >= 1) {
    return `Processing has not updated in over ${staleHours} hours. Retry processing.`
  }

  const staleMinutes = getMuxProcessingStaleMs(upload) / (60 * 1000)
  return `Processing has not updated in over ${staleMinutes} minutes. Retry processing.`
}

function formatElapsedProcessingTime(elapsedMs: number): string {
  const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000))

  if (elapsedMinutes < 1) return 'less than 1 minute'

  const hours = Math.floor(elapsedMinutes / 60)
  const minutes = elapsedMinutes % 60

  if (hours < 1) {
    return `${elapsedMinutes} minute${elapsedMinutes === 1 ? '' : 's'}`
  }

  const hourLabel = `${hours} hour${hours === 1 ? '' : 's'}`
  if (minutes === 0) return hourLabel

  return `${hourLabel} ${minutes} minute${minutes === 1 ? '' : 's'}`
}

function getMuxProcessingDurationLabel(
  upload: VideoVariantUploadRow
): string | null {
  if (upload.status !== 'muxCreated' || upload.updatedAt == null) return null

  const updatedAtMs = Date.parse(upload.updatedAt)
  if (!Number.isFinite(updatedAtMs)) return null

  const elapsedMs = Math.max(0, Date.now() - updatedAtMs)
  return `Processing for ${formatElapsedProcessingTime(elapsedMs)}`
}

function isStaleMuxProcessing(upload: VideoVariantUploadRow): boolean {
  if (upload.status !== 'muxCreated' || upload.updatedAt == null) return false

  const updatedAtMs = Date.parse(upload.updatedAt)
  if (!Number.isFinite(updatedAtMs)) return false

  return Date.now() - updatedAtMs > getMuxProcessingStaleMs(upload)
}

function getUploadLanguageLabel(upload: VideoVariantUploadRow): string {
  return (
    upload.language?.name?.[0]?.value?.trim() || `Language ${upload.languageId}`
  )
}

const coreUploadDebugLabels = new Set([
  'Upload ID',
  'Status',
  'Video ID',
  'Language ID',
  'Edition',
  'Source',
  'Created at',
  'Updated at'
])

function formatUploadDebugValue(value: unknown): string {
  if (value == null || value === '') return 'none'
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'boolean'
  ) {
    return value.toString()
  }

  return JSON.stringify(value)
}

function getUploadDebugFields(upload: VideoVariantUploadRow): Array<{
  label: string
  value: string
  isEmpty: boolean
}> {
  return [
    ['Upload ID', upload.id],
    ['Status', upload.status],
    ['Video ID', upload.videoId],
    ['Language ID', upload.languageId],
    ['Edition', upload.edition],
    ['Source', upload.source],
    ['Source key', upload.sourceKey],
    ['Original filename', upload.originalFilename],
    ['Content type', upload.contentType],
    ['Content length', upload.contentLength],
    ['R2 asset ID', upload.r2AssetId],
    ['Mux video ID', upload.muxVideoId],
    ['Video variant ID', upload.videoVariantId],
    [
      'Mux non-standard input detected at',
      upload.muxNonStandardInputDetectedAt
    ],
    ['Created at', upload.createdAt],
    ['Updated at', upload.updatedAt],
    ['Error message', upload.errorMessage]
  ].map(([label, rawValue]) => ({
    label: String(label),
    value: formatUploadDebugValue(rawValue),
    isEmpty: rawValue == null || rawValue === ''
  }))
}

function getUploadDebugText(upload: VideoVariantUploadRow): string {
  return getUploadDebugFields(upload)
    .map(({ label, value }) => `${label}: ${value}`)
    .join('\n')
}

function getUploadDebugTooltip(upload: VideoVariantUploadRow) {
  return (
    <Box sx={{ maxWidth: 420 }}>
      {getUploadDebugFields(upload)
        .filter(
          ({ label, isEmpty }) => !isEmpty || coreUploadDebugLabels.has(label)
        )
        .map(({ label, value }) => (
          <Typography
            key={label}
            variant="caption"
            component="div"
            sx={{ lineHeight: 1.4 }}
          >
            <Box component="span" sx={{ fontWeight: 600 }}>
              {label}:
            </Box>{' '}
            {value}
          </Typography>
        ))}
    </Box>
  )
}

function getIncompleteUploadDisplayState(
  upload: VideoVariantUploadRow
): IncompleteUploadDisplayState {
  switch (upload.status) {
    case 'created':
    case 'r2Prepared':
      return {
        label: 'Upload not complete',
        color: 'warning',
        message:
          'This upload cannot be resumed because the browser did not finish sending the file to R2. Add this audio language again.',
        processingDurationLabel: null,
        action: 'addAgain',
        actionLabel: 'Add again'
      }
    case 'r2Uploaded':
      return {
        label: 'Ready to process',
        color: 'warning',
        message:
          'The file uploaded successfully. Start processing to continue.',
        processingDurationLabel: null,
        action: 'resume',
        actionLabel: 'Start processing'
      }
    case 'muxCreated':
      if (isStaleMuxProcessing(upload)) {
        return {
          label: 'Stale',
          color: 'warning',
          message: getMuxProcessingStaleMessage(upload),
          processingDurationLabel: null,
          action: 'resume',
          actionLabel: 'Retry'
        }
      }

      return {
        label: 'Processing',
        color: 'info',
        message: 'Mux is processing this upload. No action needed.',
        processingDurationLabel: getMuxProcessingDurationLabel(upload),
        action: null,
        actionLabel: null
      }
    case 'muxReady':
      return {
        label: 'Ready to finalize',
        color: 'info',
        message: 'Mux is ready. Finalize this audio language.',
        processingDurationLabel: null,
        action: 'resume',
        actionLabel: 'Finalize'
      }
    case 'failed':
      return {
        label: 'Failed',
        color: 'error',
        message: null,
        processingDurationLabel: null,
        action: 'resume',
        actionLabel: 'Retry'
      }
    case 'variantCreated':
      return {
        label: 'Complete',
        color: 'info',
        message: null,
        processingDurationLabel: null,
        action: null,
        actionLabel: null
      }
  }
}

export function IncompleteVideoVariantUploadItems({
  uploads,
  resumingUploadId,
  isResumeRequestInFlight,
  onAddAudioLanguage,
  onResumeUpload
}: IncompleteVideoVariantUploadItemsProps) {
  const { enqueueSnackbar } = useSnackbar()

  const handleCopyUploadDetails = useCallback(
    async (upload: VideoVariantUploadRow) => {
      try {
        await navigator.clipboard.writeText(getUploadDebugText(upload))
        enqueueSnackbar('Copied upload details', { variant: 'success' })
      } catch {
        enqueueSnackbar('Could not copy upload details', { variant: 'error' })
      }
    },
    [enqueueSnackbar]
  )

  return uploads.map((upload) => {
    const isResuming = resumingUploadId === upload.id
    const displayState = getIncompleteUploadDisplayState(upload)

    return (
      <ListItem
        key={upload.id}
        sx={{
          border: '1px solid',
          borderColor: 'warning.light',
          backgroundColor: 'background.default',
          borderRadius: 1,
          p: 1,
          mb: 1,
          minHeight: 66,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" fontWeight={600}>
              {getUploadLanguageLabel(upload)}
            </Typography>
            <Chip
              size="small"
              label={displayState.label}
              color={displayState.color}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {upload.language?.name?.[0]?.value != null
              ? `${upload.languageId} • `
              : ''}
            {upload.edition} • {upload.source}
            {upload.originalFilename != null
              ? ` • ${upload.originalFilename}`
              : ''}
          </Typography>
          {displayState.message != null && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              {displayState.message}
            </Typography>
          )}
          {displayState.processingDurationLabel != null && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              {displayState.processingDurationLabel}
            </Typography>
          )}
          {upload.errorMessage != null && (
            <Typography
              variant="caption"
              color="error.main"
              sx={{ display: 'block' }}
            >
              {upload.errorMessage}
            </Typography>
          )}
        </Box>
        <Stack direction="row" gap={0.5} alignItems="center" sx={{ ml: 1 }}>
          <Tooltip title={getUploadDebugTooltip(upload)} placement="left" arrow>
            <IconButton size="small" aria-label="view upload details">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy upload details" arrow>
            <IconButton
              size="small"
              aria-label="copy upload details"
              onClick={() => void handleCopyUploadDetails(upload)}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {displayState.action != null && displayState.actionLabel != null && (
            <Button
              size="small"
              variant="outlined"
              startIcon={
                isResuming ? undefined : displayState.action === 'addAgain' ? (
                  <AddIcon />
                ) : (
                  <ReplayIcon />
                )
              }
              disabled={resumingUploadId != null || isResumeRequestInFlight}
              onClick={() => {
                if (displayState.action === 'addAgain') {
                  onAddAudioLanguage()
                  return
                }

                onResumeUpload(upload.id)
              }}
            >
              {isResuming ? 'Working...' : displayState.actionLabel}
            </Button>
          )}
        </Stack>
      </ListItem>
    )
  })
}
