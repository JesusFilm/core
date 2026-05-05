'use client'

import { useQuery } from '@apollo/client'
import RefreshIcon from '@mui/icons-material/Refresh'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams
} from '@mui/x-data-grid'
import Link from 'next/link'
import { ReactElement } from 'react'

import { ResultOf, VariablesOf, graphql } from '@core/shared/gql'

const PAGE_SIZE = 25

const GET_UPLOAD_STATE_ISSUES = graphql(`
  query GetUploadStateIssues($limit: Int, $offset: Int) {
    uploadStateIssues(limit: $limit, offset: $offset) {
      r2AssetId
      fileName
      videoId
      stage
      r2CreatedAt
      muxVideoId
      muxReadyToStream
    }
  }
`)

type UploadStateData = ResultOf<typeof GET_UPLOAD_STATE_ISSUES>
type UploadStateVars = VariablesOf<typeof GET_UPLOAD_STATE_ISSUES>

const STAGE_LABELS: Record<string, string> = {
  no_mux: 'no Mux video',
  mux_not_ready: 'Mux not ready',
  no_variant: 'no Variant'
}

const STAGE_COLORS: Record<string, 'error' | 'warning' | 'info'> = {
  no_mux: 'error',
  mux_not_ready: 'warning',
  no_variant: 'info'
}

function VideoLinkCell(
  params: GridRenderCellParams<{ videoId: string | null }>
): ReactElement {
  const videoId = params.row.videoId
  if (videoId == null) {
    return (
      <Typography variant="body2" color="text.secondary">
        unattached
      </Typography>
    )
  }
  return (
    <Link
      href={`/videos/${videoId}`}
      style={{ color: 'inherit', textDecoration: 'underline' }}
      aria-label={`Open video ${videoId}`}
    >
      {videoId}
    </Link>
  )
}

export function UploadState(): ReactElement {
  const { data, loading, error, refetch } = useQuery<
    UploadStateData,
    UploadStateVars
  >(GET_UPLOAD_STATE_ISSUES, {
    variables: { limit: 500, offset: 0 },
    fetchPolicy: 'cache-and-network'
  })

  const handleRefresh = (): void => {
    void refetch()
  }

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleRefresh()
    }
  }

  const rows =
    data?.uploadStateIssues.map((issue) => ({
      id: issue.r2AssetId,
      r2AssetId: issue.r2AssetId,
      fileName: issue.fileName,
      videoId: issue.videoId,
      stage: issue.stage,
      r2CreatedAt: new Date(issue.r2CreatedAt),
      muxVideoId: issue.muxVideoId,
      muxReadyToStream: issue.muxReadyToStream
    })) ?? []

  const columns: GridColDef[] = [
    {
      field: 'fileName',
      headerName: 'File name',
      flex: 1,
      minWidth: 220
    },
    {
      field: 'videoId',
      headerName: 'Video',
      flex: 1,
      minWidth: 200,
      renderCell: VideoLinkCell
    },
    {
      field: 'stage',
      headerName: 'Stage',
      width: 160,
      renderCell: (params) => (
        <Chip
          size="small"
          color={STAGE_COLORS[params.value as string] ?? 'default'}
          label={STAGE_LABELS[params.value as string] ?? params.value}
        />
      )
    },
    {
      field: 'r2CreatedAt',
      headerName: 'R2 created',
      width: 180,
      type: 'dateTime',
      valueFormatter: (value: Date) => value.toLocaleString()
    },
    {
      field: 'muxVideoId',
      headerName: 'Mux video',
      flex: 1,
      minWidth: 220,
      renderCell: (params) =>
        params.value != null ? (
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {params.value}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        )
    },
    {
      field: 'muxReadyToStream',
      headerName: 'Mux ready',
      width: 110,
      renderCell: (params) => {
        if (params.value == null)
          return (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          )
        return (
          <Chip
            size="small"
            color={params.value === true ? 'success' : 'warning'}
            label={params.value === true ? 'yes' : 'no'}
          />
        )
      }
    },
    {
      field: 'r2AssetId',
      headerName: 'R2 asset ID',
      flex: 1,
      minWidth: 240,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      )
    }
  ]

  return (
    <Stack spacing={3} sx={{ height: 'calc(100vh - 150px)', width: '100%' }}>
      <Stack spacing={1}>
        <Typography variant="h4">Videos Upload State</Typography>
        <Typography variant="body2" color="text.secondary">
          R2 → Mux → VideoVariant lifecycle gaps. The view is unfiltered, so
          legacy assets predating the new importer can appear here.
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          {loading
            ? 'Running check…'
            : `${rows.length} issue${rows.length === 1 ? '' : 's'} found`}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="Refresh upload state check"
        >
          Refresh
        </Button>
      </Stack>
      {error?.message != null && (
        <Alert severity="error" role="alert">
          {error.message}
        </Alert>
      )}
      <Box sx={{ flexGrow: 1, minHeight: 400 }}>
        <DataGrid
          density="compact"
          loading={loading}
          rows={rows}
          columns={columns}
          data-testid="UploadStateIssuesGrid"
          pageSizeOptions={[PAGE_SIZE, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: PAGE_SIZE } }
          }}
          disableRowSelectionOnClick
        />
      </Box>
    </Stack>
  )
}
