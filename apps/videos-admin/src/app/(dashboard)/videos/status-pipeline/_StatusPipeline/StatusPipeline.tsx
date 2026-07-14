'use client'

import { useMutation, useQuery } from '@apollo/client'
import ReplayIcon from '@mui/icons-material/Replay'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowsProp
} from '@mui/x-data-grid'
import NextLink from 'next/link'
import { useSnackbar } from 'notistack'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

import { graphql } from '@core/shared/gql'

import { DEFAULT_VIDEO_LANGUAGE_ID } from '../../constants'

type VideoVariantUploadStatus =
  | 'created'
  | 'r2Prepared'
  | 'r2Uploaded'
  | 'muxCreated'
  | 'muxReady'
  | 'variantCreated'
  | 'failed'

type StatusFilterValue = 'notComplete' | VideoVariantUploadStatus

interface VideoVariantUploadRow {
  id: string
  source: string
  sourceKey?: string | null
  status: VideoVariantUploadStatus
  videoId?: string | null
  languageId: string
  language?: {
    id: string
    name?: Array<{ value?: string | null }> | null
  } | null
  edition: string
  originalFilename?: string | null
  errorMessage?: string | null
  r2AssetId?: string | null
  muxVideoId?: string | null
  muxNonStandardInputDetectedAt?: string | null
  videoVariantId?: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

interface StatusPipelineRow {
  id: string
  upload: VideoVariantUploadRow
  status: VideoVariantUploadStatus
  videoId: string
  language: string
  edition: string
  source: string
  sourceKey: string
  originalFilename: string
  r2AssetId: string
  muxVideoId: string
  muxNonStandardInputDetectedAt: string
  videoVariantId: string
  errorMessage: string
  createdAt: string
  updatedAt: string
}

export const STATUS_PIPELINE_UPLOAD_LIMIT = 100
const POLLING_INTERVAL_MS = 3000
const STANDARD_MUX_PROCESSING_STALE_MS = 30 * 60 * 1000
const NON_STANDARD_MUX_PROCESSING_STALE_MS = 2 * 60 * 60 * 1000

const NOT_COMPLETE_STATUSES: VideoVariantUploadStatus[] = [
  'created',
  'r2Prepared',
  'r2Uploaded',
  'muxCreated',
  'muxReady',
  'failed'
]

const STATUS_FILTER_OPTIONS: Array<{
  value: StatusFilterValue
  label: string
}> = [
  { value: 'notComplete', label: 'Not complete' },
  { value: 'created', label: 'Created' },
  { value: 'r2Prepared', label: 'R2 prepared' },
  { value: 'r2Uploaded', label: 'R2 uploaded' },
  { value: 'muxCreated', label: 'Mux created' },
  { value: 'muxReady', label: 'Mux ready' },
  { value: 'failed', label: 'Failed' },
  { value: 'variantCreated', label: 'Variant created' }
]

const GET_STATUS_PIPELINE_UPLOADS = graphql(`
  query GetStatusPipelineUploads(
    $input: VideoVariantUploadsFilter
    $limit: Int
    $languageId: ID
  ) {
    videoVariantUploads(input: $input, limit: $limit) {
      id
      source
      sourceKey
      status
      videoId
      languageId
      language {
        id
        name(languageId: $languageId) {
          value
        }
      }
      edition
      originalFilename
      errorMessage
      r2AssetId
      muxVideoId
      muxNonStandardInputDetectedAt
      videoVariantId
      updatedAt
      createdAt
    }
  }
`)

const RESUME_VIDEO_VARIANT_UPLOAD = graphql(`
  mutation ResumeStatusPipelineUpload(
    $id: ID!
    $downloadable: Boolean
    $maxResolution: MaxResolutionTier
  ) {
    videoVariantUploadResume(
      id: $id
      downloadable: $downloadable
      maxResolution: $maxResolution
    ) {
      id
      status
      errorMessage
      muxVideoId
      muxNonStandardInputDetectedAt
      videoVariantId
      updatedAt
    }
  }
`)

function getStatusesForFilter(
  statusFilter: StatusFilterValue
): VideoVariantUploadStatus[] {
  return statusFilter === 'notComplete' ? NOT_COMPLETE_STATUSES : [statusFilter]
}

function getOptionalText(value: string | null | undefined): string {
  return value == null || value === '' ? 'none' : value
}

function getLanguageLabel(upload: VideoVariantUploadRow): string {
  return (
    upload.language?.name?.[0]?.value?.trim() || `Language ${upload.languageId}`
  )
}

function getMuxProcessingStaleMs(upload: VideoVariantUploadRow): number {
  return upload.muxNonStandardInputDetectedAt == null
    ? STANDARD_MUX_PROCESSING_STALE_MS
    : NON_STANDARD_MUX_PROCESSING_STALE_MS
}

function isStaleMuxProcessing(upload: VideoVariantUploadRow): boolean {
  if (upload.status !== 'muxCreated' || upload.updatedAt == null) return false

  const updatedAtMs = Date.parse(upload.updatedAt)
  if (!Number.isFinite(updatedAtMs)) return false

  return Date.now() - updatedAtMs > getMuxProcessingStaleMs(upload)
}

function getResumeActionLabel(upload: VideoVariantUploadRow): string | null {
  switch (upload.status) {
    case 'r2Uploaded':
      return 'Start processing'
    case 'muxCreated':
      return isStaleMuxProcessing(upload) ? 'Retry' : null
    case 'muxReady':
      return 'Finalize'
    case 'failed':
      return 'Retry'
    case 'created':
    case 'r2Prepared':
    case 'variantCreated':
      return null
  }
}

function isNotComplete(upload: VideoVariantUploadRow): boolean {
  return upload.status !== 'variantCreated'
}

function getRow(upload: VideoVariantUploadRow): StatusPipelineRow {
  return {
    id: upload.id,
    upload,
    status: upload.status,
    videoId: getOptionalText(upload.videoId),
    language: getLanguageLabel(upload),
    edition: upload.edition,
    source: upload.source,
    sourceKey: getOptionalText(upload.sourceKey),
    originalFilename: getOptionalText(upload.originalFilename),
    r2AssetId: getOptionalText(upload.r2AssetId),
    muxVideoId: getOptionalText(upload.muxVideoId),
    muxNonStandardInputDetectedAt: getOptionalText(
      upload.muxNonStandardInputDetectedAt
    ),
    videoVariantId: getOptionalText(upload.videoVariantId),
    errorMessage: getOptionalText(upload.errorMessage),
    createdAt: getOptionalText(upload.createdAt),
    updatedAt: getOptionalText(upload.updatedAt)
  }
}

function StatusChip({
  status
}: {
  status: VideoVariantUploadStatus
}): ReactElement {
  const color =
    status === 'failed'
      ? 'error'
      : status === 'variantCreated'
        ? 'success'
        : 'warning'

  return <Chip size="small" color={color} label={status} />
}

export function StatusPipeline(): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterValue>('notComplete')
  const [resumingUploadId, setResumingUploadId] = useState<string | null>(null)
  const [isResumeRequestInFlight, setIsResumeRequestInFlight] = useState(false)
  const selectedStatuses = useMemo(
    () => getStatusesForFilter(statusFilter),
    [statusFilter]
  )

  const { data, loading, error, refetch, startPolling, stopPolling } = useQuery(
    GET_STATUS_PIPELINE_UPLOADS,
    {
      variables: {
        input: { statuses: selectedStatuses },
        limit: STATUS_PIPELINE_UPLOAD_LIMIT,
        languageId: DEFAULT_VIDEO_LANGUAGE_ID
      },
      fetchPolicy: 'cache-and-network'
    }
  )

  const [resumeVideoVariantUpload] = useMutation(RESUME_VIDEO_VARIANT_UPLOAD)

  const uploads = useMemo(
    () => (data?.videoVariantUploads ?? []) as VideoVariantUploadRow[],
    [data?.videoVariantUploads]
  )
  const rows: GridRowsProp<StatusPipelineRow> = uploads.map(getRow)
  const hasVisibleIncompleteRows = uploads.some(isNotComplete)

  useEffect(() => {
    if (hasVisibleIncompleteRows || resumingUploadId != null) {
      startPolling(POLLING_INTERVAL_MS)
      return () => stopPolling()
    }

    stopPolling()
  }, [hasVisibleIncompleteRows, resumingUploadId, startPolling, stopPolling])

  useEffect(() => {
    if (resumingUploadId == null || isResumeRequestInFlight || loading) return

    const upload = uploads.find((row) => row.id === resumingUploadId)
    if (upload == null) {
      setResumingUploadId(null)
      return
    }

    if (upload.status === 'variantCreated') {
      setResumingUploadId(null)
      enqueueSnackbar('Upload recovered', { variant: 'success' })
      return
    }

    if (upload.status === 'failed') {
      setResumingUploadId(null)
      enqueueSnackbar(upload.errorMessage ?? 'Video upload resume failed', {
        variant: 'error'
      })
    }
  }, [
    enqueueSnackbar,
    isResumeRequestInFlight,
    loading,
    resumingUploadId,
    uploads
  ])

  const handleStatusFilterChange = (event: SelectChangeEvent): void => {
    setStatusFilter(event.target.value as StatusFilterValue)
  }

  const handleResumeUpload = useCallback(
    async (uploadId: string): Promise<void> => {
      setIsResumeRequestInFlight(true)
      try {
        const result = await resumeVideoVariantUpload({
          variables: {
            id: uploadId,
            downloadable: true,
            maxResolution: 'uhd'
          }
        })
        const upload = result.data?.videoVariantUploadResume

        if (upload?.status === 'variantCreated') {
          setResumingUploadId(null)
          enqueueSnackbar('Upload recovered', { variant: 'success' })
          await refetch()
          return
        }

        if (upload?.status === 'failed') {
          setResumingUploadId(null)
          enqueueSnackbar(upload.errorMessage ?? 'Video upload resume failed', {
            variant: 'error'
          })
          return
        }

        setResumingUploadId(uploadId)
        await refetch()
      } catch (error) {
        setResumingUploadId(null)
        enqueueSnackbar(
          error instanceof Error ? error.message : 'Video upload resume failed',
          { variant: 'error' }
        )
      } finally {
        setIsResumeRequestInFlight(false)
      }
    },
    [enqueueSnackbar, refetch, resumeVideoVariantUpload]
  )

  const columns: GridColDef<StatusPipelineRow>[] = [
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
      renderCell: (
        params: GridRenderCellParams<
          StatusPipelineRow,
          VideoVariantUploadStatus
        >
      ) => <StatusChip status={params.value ?? params.row.status} />
    },
    {
      field: 'videoId',
      headerName: 'Video ID',
      minWidth: 180,
      renderCell: (params) =>
        params.row.upload.videoId != null &&
        params.row.upload.videoId !== '' ? (
          <Link
            component={NextLink}
            href={`/videos/${params.row.upload.videoId}`}
          >
            {params.row.upload.videoId}
          </Link>
        ) : (
          <Typography variant="body2" color="text.secondary">
            none
          </Typography>
        )
    },
    { field: 'language', headerName: 'Language', minWidth: 180 },
    { field: 'edition', headerName: 'Edition', minWidth: 120 },
    { field: 'source', headerName: 'Source', minWidth: 160 },
    { field: 'sourceKey', headerName: 'Source key', minWidth: 180 },
    {
      field: 'originalFilename',
      headerName: 'Original filename',
      minWidth: 220
    },
    { field: 'id', headerName: 'Upload ID', minWidth: 180 },
    { field: 'r2AssetId', headerName: 'R2 asset ID', minWidth: 180 },
    { field: 'muxVideoId', headerName: 'Mux video ID', minWidth: 180 },
    {
      field: 'muxNonStandardInputDetectedAt',
      headerName: 'Mux non-standard input',
      minWidth: 240
    },
    { field: 'videoVariantId', headerName: 'Video variant ID', minWidth: 180 },
    { field: 'errorMessage', headerName: 'Error message', minWidth: 240 },
    { field: 'createdAt', headerName: 'Created', minWidth: 210 },
    { field: 'updatedAt', headerName: 'Updated', minWidth: 210 },
    {
      field: 'actions',
      headerName: 'Action',
      minWidth: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const actionLabel = getResumeActionLabel(params.row.upload)
        if (actionLabel == null) {
          if (
            params.row.upload.videoId != null &&
            params.row.upload.videoId !== ''
          ) {
            return (
              <Button
                size="small"
                component={NextLink}
                href={`/videos/${params.row.upload.videoId}`}
              >
                Open video
              </Button>
            )
          }

          return (
            <Typography variant="body2" color="text.secondary">
              No action
            </Typography>
          )
        }

        const isResuming = resumingUploadId === params.row.upload.id

        return (
          <Button
            size="small"
            variant="outlined"
            startIcon={isResuming ? undefined : <ReplayIcon />}
            disabled={resumingUploadId != null || isResumeRequestInFlight}
            onClick={() => void handleResumeUpload(params.row.upload.id)}
          >
            {isResuming ? 'Working...' : actionLabel}
          </Button>
        )
      }
    }
  ]

  return (
    <Stack
      sx={{
        width: '100%',
        height: 'calc(100vh - 210px)',
        minHeight: 420,
        overflow: 'hidden'
      }}
      gap={2}
    >
      <Typography variant="h4">Video Status Pipeline</Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="status-pipeline-filter-label">Status</InputLabel>
          <Select
            labelId="status-pipeline-filter-label"
            label="Status"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            {STATUS_FILTER_OPTIONS.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary">
          Showing the latest {STATUS_PIPELINE_UPLOAD_LIMIT} upload rows.
        </Typography>
      </Stack>
      {error != null && <Alert severity="error">{error.message}</Alert>}
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 50 }
            }
          }}
          pageSizeOptions={[25, 50, 100]}
        />
      </Box>
    </Stack>
  )
}
