'use client'

import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ReplayIcon from '@mui/icons-material/Replay'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { type ReactElement, useCallback, useState } from 'react'

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

const incompleteUploadStatuses: VideoVariantUploadStatus[] = [
  'created',
  'r2Prepared',
  'r2Uploaded',
  'muxCreated',
  'muxReady',
  'failed'
]

// Successful attempts are requested alongside the incomplete ones because they
// are the only evidence that an earlier incomplete attempt has been superseded.
export const uploadHistoryStatuses: VideoVariantUploadStatus[] = [
  ...incompleteUploadStatuses,
  'variantCreated'
]

const uploadStatusLabels: Record<VideoVariantUploadStatus, string> = {
  created: 'Upload not complete',
  r2Prepared: 'Upload not complete',
  r2Uploaded: 'Ready to process',
  muxCreated: 'Processing',
  muxReady: 'Ready to finalize',
  variantCreated: 'Complete',
  failed: 'Failed'
}

const uploadCardSx = {
  border: '1px solid',
  backgroundColor: 'background.default',
  borderRadius: 1,
  p: 1,
  mb: 1
} as const

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
  outstandingUploads: VideoVariantUploadRow[]
  supersededUploads: VideoVariantUploadRow[]
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
  // The status alone decides the label; the switch decides only how the row
  // reads and what it offers. Stale Mux processing is the one override.
  const label = uploadStatusLabels[upload.status]

  switch (upload.status) {
    case 'created':
    case 'r2Prepared':
      return {
        label,
        color: 'warning',
        message:
          'This upload cannot be resumed because the browser did not finish sending the file to R2. Start a fresh upload for this language.',
        processingDurationLabel: null,
        action: 'addAgain',
        actionLabel: 'Start fresh upload'
      }
    case 'r2Uploaded':
      return {
        label,
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
        label,
        color: 'info',
        message: 'Mux is processing this upload. No action needed.',
        processingDurationLabel: getMuxProcessingDurationLabel(upload),
        action: null,
        actionLabel: null
      }
    case 'muxReady':
      return {
        label,
        color: 'info',
        message: 'Mux is ready. Finalize this audio language.',
        processingDurationLabel: null,
        action: 'resume',
        actionLabel: 'Finalize'
      }
    case 'failed':
      return {
        label,
        color: 'error',
        message: null,
        processingDurationLabel: null,
        action: 'resume',
        actionLabel: 'Retry'
      }
    // Unreachable in practice — the partition never renders a successful
    // attempt — but the switch must stay exhaustive over the status union.
    case 'variantCreated':
      return {
        label,
        color: 'info',
        message: null,
        processingDurationLabel: null,
        action: null,
        actionLabel: null
      }
  }
}

function getUploadMetaLabel(upload: VideoVariantUploadRow): string {
  const languagePrefix =
    upload.language?.name?.[0]?.value != null ? `${upload.languageId} • ` : ''
  const filenameSuffix =
    upload.originalFilename != null ? ` • ${upload.originalFilename}` : ''

  return `${languagePrefix}${upload.edition} • ${upload.source}${filenameSuffix}`
}

interface SupersededUploadGroup {
  key: string
  languageLabel: string
  edition: string
  uploads: VideoVariantUploadRow[]
}

/**
 * One summary line per audio language *and edition*, matching the key the
 * supersession rule itself uses, so a completed `base` history never reports a
 * count that silently includes Burned In attempts.
 *
 * Display ordering is owned here rather than by the caller: attempts run
 * newest-first within a group, and groups run newest-first by their most
 * recent attempt.
 */
function groupSupersededUploadsByLanguage(
  uploads: VideoVariantUploadRow[]
): SupersededUploadGroup[] {
  const groups = new Map<string, SupersededUploadGroup>()

  for (const upload of uploads) {
    const key = `${upload.languageId}\u0000${upload.edition}`
    const group = groups.get(key)

    if (group == null) {
      groups.set(key, {
        key,
        languageLabel: getUploadLanguageLabel(upload),
        edition: upload.edition,
        uploads: [upload]
      })
      continue
    }

    group.uploads.push(upload)
  }

  const byCreatedAtDescending = (
    a: VideoVariantUploadRow,
    b: VideoVariantUploadRow
  ): number => (getUploadCreatedAtMs(b) ?? 0) - (getUploadCreatedAtMs(a) ?? 0)

  const sortedGroups = [...groups.values()].map((group) => ({
    ...group,
    uploads: [...group.uploads].sort(byCreatedAtDescending)
  }))

  return sortedGroups.sort((a, b) =>
    byCreatedAtDescending(a.uploads[0], b.uploads[0])
  )
}

export function getUploadCreatedAtMs(
  upload: VideoVariantUploadRow
): number | null {
  if (upload.createdAt == null) return null

  const createdAtMs = Date.parse(upload.createdAt)
  return Number.isFinite(createdAtMs) ? createdAtMs : null
}

function getUploadTimestampLabel(upload: VideoVariantUploadRow): string | null {
  const createdAtMs = getUploadCreatedAtMs(upload)
  if (createdAtMs == null) return null

  return new Date(createdAtMs).toLocaleString()
}

export function IncompleteVideoVariantUploadItems({
  outstandingUploads,
  supersededUploads,
  resumingUploadId,
  isResumeRequestInFlight,
  onAddAudioLanguage,
  onResumeUpload
}: IncompleteVideoVariantUploadItemsProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<string[]>([])

  const handleTogglePreviousAttempts = useCallback((groupKey: string) => {
    setExpandedGroupKeys((expanded) =>
      expanded.includes(groupKey)
        ? expanded.filter((key) => key !== groupKey)
        : [...expanded, groupKey]
    )
  }, [])

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

  const renderUploadDetailActions = (
    upload: VideoVariantUploadRow
  ): ReactElement => (
    <>
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
    </>
  )

  return (
    <>
      {outstandingUploads.map((upload) => {
        const isResuming = resumingUploadId === upload.id
        const displayState = getIncompleteUploadDisplayState(upload)

        return (
          <ListItem
            key={upload.id}
            sx={{
              ...uploadCardSx,
              borderColor: 'warning.light',
              minHeight: 66,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                sx={{
                  gap: 1,
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600
                  }}
                >
                  {getUploadLanguageLabel(upload)}
                </Typography>
                <Chip
                  size="small"
                  label={displayState.label}
                  color={displayState.color}
                />
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary'
                }}
              >
                {getUploadMetaLabel(upload)}
              </Typography>
              {displayState.message != null && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block'
                  }}
                >
                  {displayState.message}
                </Typography>
              )}
              {displayState.processingDurationLabel != null && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block'
                  }}
                >
                  {displayState.processingDurationLabel}
                </Typography>
              )}
              {upload.errorMessage != null && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'error.main',
                    display: 'block'
                  }}
                >
                  {upload.errorMessage}
                </Typography>
              )}
            </Box>
            <Stack
              direction="row"
              sx={{
                gap: 0.5,
                alignItems: 'center',
                ml: 1
              }}
            >
              {renderUploadDetailActions(upload)}
              {displayState.action != null &&
                displayState.actionLabel != null && (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={
                      isResuming ? undefined : displayState.action ===
                        'addAgain' ? (
                        <AddIcon />
                      ) : (
                        <ReplayIcon />
                      )
                    }
                    disabled={
                      resumingUploadId != null || isResumeRequestInFlight
                    }
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
      })}
      {groupSupersededUploadsByLanguage(supersededUploads).map((group) => {
        const isExpanded = expandedGroupKeys.includes(group.key)

        return (
          <ListItem
            key={`superseded-${group.key}`}
            sx={{ ...uploadCardSx, borderColor: 'divider', display: 'block' }}
          >
            <Stack
              direction="row"
              sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: 'text.secondary' }}
              >
                {group.languageLabel}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {group.edition}
              </Typography>
              <Button
                size="small"
                aria-expanded={isExpanded}
                aria-label={`previous attempts for ${group.languageLabel} (${group.edition})`}
                startIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => handleTogglePreviousAttempts(group.key)}
                sx={{ color: 'text.secondary', textTransform: 'none' }}
              >
                {`Previous attempts (${group.uploads.length})`}
              </Button>
            </Stack>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block' }}
            >
              Superseded by a later successful upload. No action needed.
            </Typography>
            <Collapse in={isExpanded} unmountOnExit>
              <Stack sx={{ gap: 1, mt: 1 }}>
                {group.uploads.map((upload) => {
                  const timestampLabel = getUploadTimestampLabel(upload)

                  return (
                    <Box
                      key={upload.id}
                      data-testid="SupersededUploadAttempt"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        pt: 1
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={uploadStatusLabels[upload.status]}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', display: 'block' }}
                        >
                          {getUploadMetaLabel(upload)}
                        </Typography>
                        {timestampLabel != null && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: 'block' }}
                          >
                            {timestampLabel}
                          </Typography>
                        )}
                        {upload.errorMessage != null && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', display: 'block' }}
                          >
                            {upload.errorMessage}
                          </Typography>
                        )}
                      </Box>
                      <Stack
                        direction="row"
                        sx={{ gap: 0.5, alignItems: 'center', ml: 1 }}
                      >
                        {renderUploadDetailActions(upload)}
                      </Stack>
                    </Box>
                  )
                })}
              </Stack>
            </Collapse>
          </ListItem>
        )
      })}
    </>
  )
}
