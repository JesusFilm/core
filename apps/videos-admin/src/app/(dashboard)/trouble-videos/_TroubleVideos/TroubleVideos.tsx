'use client'

import { useMutation, useQuery } from '@apollo/client'
import RefreshIcon from '@mui/icons-material/Refresh'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams
} from '@mui/x-data-grid'
import Link from 'next/link'
import { ReactElement, useState } from 'react'

import { ResultOf, VariablesOf, graphql } from '@core/shared/gql'

const PAGE_SIZE = 25

const GET_AVAILABLE_LANGUAGES_ISSUES = graphql(`
  query GetAvailableLanguagesIssues($limit: Int, $offset: Int) {
    availableLanguagesIssues(limit: $limit, offset: $offset) {
      videoId
      videoTitle
      expected
      actual
      missing
      extra
    }
  }
`)

const GET_ALGOLIA_VIDEO_DRIFT = graphql(`
  query GetAlgoliaVideoDrift($limit: Int, $offset: Int) {
    algoliaVideoDrift(limit: $limit, offset: $offset) {
      videoId
      videoTitle
      kind
      mismatches {
        field
        expected
        actual
      }
    }
  }
`)

const GET_ALGOLIA_VARIANT_DRIFT = graphql(`
  query GetAlgoliaVariantDrift($limit: Int, $offset: Int) {
    algoliaVariantDrift(limit: $limit, offset: $offset) {
      variantId
      videoId
      kind
    }
  }
`)

const FIX_VIDEO_LANGUAGES = graphql(`
  mutation TroubleVideosFixLanguages($videoId: ID!) {
    fixVideoLanguages(videoId: $videoId)
  }
`)

const UPDATE_VIDEO_ALGOLIA_INDEX = graphql(`
  mutation TroubleVideosUpdateVideoAlgoliaIndex($videoId: ID!) {
    updateVideoAlgoliaIndex(videoId: $videoId)
  }
`)

const UPDATE_VIDEO_VARIANT_ALGOLIA_INDEX = graphql(`
  mutation TroubleVideosUpdateVariantAlgoliaIndex($videoId: ID!) {
    updateVideoVariantAlgoliaIndex(videoId: $videoId)
  }
`)

type AvailableLanguagesIssuesData = ResultOf<
  typeof GET_AVAILABLE_LANGUAGES_ISSUES
>
type AvailableLanguagesIssuesVars = VariablesOf<
  typeof GET_AVAILABLE_LANGUAGES_ISSUES
>
type AlgoliaVideoDriftData = ResultOf<typeof GET_ALGOLIA_VIDEO_DRIFT>
type AlgoliaVideoDriftVars = VariablesOf<typeof GET_ALGOLIA_VIDEO_DRIFT>
type AlgoliaVariantDriftData = ResultOf<typeof GET_ALGOLIA_VARIANT_DRIFT>
type AlgoliaVariantDriftVars = VariablesOf<typeof GET_ALGOLIA_VARIANT_DRIFT>

type TabValue = 'languages' | 'algoliaVideos' | 'algoliaVariants'

function VideoLinkCell(
  params: GridRenderCellParams<{ videoId: string; videoTitle?: string | null }>
): ReactElement {
  const { videoId, videoTitle } = params.row
  return (
    <Link
      href={`/videos/${videoId}`}
      style={{ color: 'inherit', textDecoration: 'underline' }}
      aria-label={`Open video ${videoTitle ?? videoId}`}
    >
      {videoTitle ?? videoId}
    </Link>
  )
}

function AvailableLanguagesPanel(): ReactElement {
  const { data, loading, error, refetch } = useQuery<
    AvailableLanguagesIssuesData,
    AvailableLanguagesIssuesVars
  >(GET_AVAILABLE_LANGUAGES_ISSUES, {
    variables: { limit: 500, offset: 0 },
    fetchPolicy: 'cache-and-network'
  })
  const [fixLanguages, { loading: fixLoading }] = useMutation(
    FIX_VIDEO_LANGUAGES,
    {
      refetchQueries: [
        { query: GET_AVAILABLE_LANGUAGES_ISSUES, variables: { limit: 500, offset: 0 } }
      ]
    }
  )

  const handleRefresh = (): void => {
    void refetch()
  }

  const handleFix = (videoId: string): void => {
    void fixLanguages({ variables: { videoId } })
  }

  const rows =
    data?.availableLanguagesIssues.map((issue) => ({
      id: issue.videoId,
      videoId: issue.videoId,
      videoTitle: issue.videoTitle,
      missing: issue.missing.join(', '),
      extra: issue.extra.join(', '),
      expectedCount: issue.expected.length,
      actualCount: issue.actual.length
    })) ?? []

  const columns: GridColDef[] = [
    {
      field: 'videoTitle',
      headerName: 'Video',
      flex: 1,
      minWidth: 220,
      renderCell: VideoLinkCell
    },
    { field: 'missing', headerName: 'Missing langs', flex: 1, minWidth: 180 },
    { field: 'extra', headerName: 'Extra langs', flex: 1, minWidth: 180 },
    { field: 'expectedCount', headerName: 'Expected', width: 100 },
    { field: 'actualCount', headerName: 'Actual', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          disabled={fixLoading}
          onClick={() => handleFix(params.row.videoId)}
          aria-label={`Fix available languages for ${params.row.videoTitle ?? params.row.videoId}`}
        >
          Fix
        </Button>
      )
    }
  ]

  return (
    <PanelShell
      loading={loading}
      error={error?.message ?? null}
      count={rows.length}
      onRefresh={handleRefresh}
      rows={rows}
      columns={columns}
      gridTestId="AvailableLanguagesIssuesGrid"
    />
  )
}

function AlgoliaVideoDriftPanel(): ReactElement {
  const { data, loading, error, refetch } = useQuery<
    AlgoliaVideoDriftData,
    AlgoliaVideoDriftVars
  >(GET_ALGOLIA_VIDEO_DRIFT, {
    variables: { limit: 500, offset: 0 },
    fetchPolicy: 'cache-and-network'
  })
  const [updateIndex, { loading: updateLoading }] = useMutation(
    UPDATE_VIDEO_ALGOLIA_INDEX,
    {
      refetchQueries: [
        { query: GET_ALGOLIA_VIDEO_DRIFT, variables: { limit: 500, offset: 0 } }
      ]
    }
  )

  const handleRefresh = (): void => {
    void refetch()
  }

  const handleResync = (videoId: string): void => {
    void updateIndex({ variables: { videoId } })
  }

  const rows =
    data?.algoliaVideoDrift.map((issue) => ({
      id: `${issue.videoId}-${issue.kind}`,
      videoId: issue.videoId,
      videoTitle: issue.videoTitle,
      kind: issue.kind,
      mismatchSummary: issue.mismatches
        .map((m) => `${m.field}: ${m.expected ?? 'null'} → ${m.actual ?? 'null'}`)
        .join('; ')
    })) ?? []

  const columns: GridColDef[] = [
    {
      field: 'videoTitle',
      headerName: 'Video',
      flex: 1,
      minWidth: 220,
      renderCell: VideoLinkCell
    },
    {
      field: 'kind',
      headerName: 'Drift',
      width: 160,
      renderCell: (params) => <Chip size="small" label={params.value} />
    },
    {
      field: 'mismatchSummary',
      headerName: 'Mismatch fields',
      flex: 2,
      minWidth: 320
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          disabled={updateLoading || params.row.kind === 'missing_in_db'}
          onClick={() => handleResync(params.row.videoId)}
          aria-label={`Resync video ${params.row.videoTitle ?? params.row.videoId} to Algolia`}
        >
          Resync
        </Button>
      )
    }
  ]

  return (
    <PanelShell
      loading={loading}
      error={error?.message ?? null}
      count={rows.length}
      onRefresh={handleRefresh}
      rows={rows}
      columns={columns}
      gridTestId="AlgoliaVideoDriftGrid"
    />
  )
}

function AlgoliaVariantDriftPanel(): ReactElement {
  const { data, loading, error, refetch } = useQuery<
    AlgoliaVariantDriftData,
    AlgoliaVariantDriftVars
  >(GET_ALGOLIA_VARIANT_DRIFT, {
    variables: { limit: 500, offset: 0 },
    fetchPolicy: 'cache-and-network'
  })
  const [updateIndex, { loading: updateLoading }] = useMutation(
    UPDATE_VIDEO_VARIANT_ALGOLIA_INDEX,
    {
      refetchQueries: [
        {
          query: GET_ALGOLIA_VARIANT_DRIFT,
          variables: { limit: 500, offset: 0 }
        }
      ]
    }
  )

  const handleRefresh = (): void => {
    void refetch()
  }

  const handleResync = (videoId: string): void => {
    void updateIndex({ variables: { videoId } })
  }

  const rows =
    data?.algoliaVariantDrift.map((issue) => ({
      id: `${issue.variantId}-${issue.kind}`,
      variantId: issue.variantId,
      videoId: issue.videoId,
      kind: issue.kind
    })) ?? []

  const columns: GridColDef[] = [
    { field: 'variantId', headerName: 'Variant ID', flex: 1, minWidth: 240 },
    {
      field: 'videoId',
      headerName: 'Video',
      flex: 1,
      minWidth: 220,
      renderCell: (params) =>
        params.value != null ? (
          <Link
            href={`/videos/${params.value}`}
            style={{ color: 'inherit', textDecoration: 'underline' }}
            aria-label={`Open video ${params.value}`}
          >
            {params.value}
          </Link>
        ) : (
          <Typography variant="body2" color="text.secondary">
            unknown
          </Typography>
        )
    },
    {
      field: 'kind',
      headerName: 'Drift',
      width: 160,
      renderCell: (params) => <Chip size="small" label={params.value} />
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          disabled={
            updateLoading ||
            params.row.videoId == null ||
            params.row.kind === 'missing_in_db'
          }
          onClick={() => handleResync(params.row.videoId)}
          aria-label={`Resync variants of ${params.row.videoId ?? params.row.variantId}`}
        >
          Resync video
        </Button>
      )
    }
  ]

  return (
    <PanelShell
      loading={loading}
      error={error?.message ?? null}
      count={rows.length}
      onRefresh={handleRefresh}
      rows={rows}
      columns={columns}
      gridTestId="AlgoliaVariantDriftGrid"
    />
  )
}

interface PanelShellProps {
  loading: boolean
  error: string | null
  count: number
  onRefresh: () => void
  rows: Array<{ id: string }>
  columns: GridColDef[]
  gridTestId: string
}

function PanelShell({
  loading,
  error,
  count,
  onRefresh,
  rows,
  columns,
  gridTestId
}: PanelShellProps): ReactElement {
  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onRefresh()
    }
  }

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Running check…' : `${count} issue${count === 1 ? '' : 's'} found`}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="Refresh check"
        >
          Refresh
        </Button>
      </Stack>
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <Box sx={{ flexGrow: 1, minHeight: 400 }}>
        <DataGrid
          density="compact"
          loading={loading}
          rows={rows}
          columns={columns}
          data-testid={gridTestId}
          pageSizeOptions={[PAGE_SIZE, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: PAGE_SIZE } } }}
          disableRowSelectionOnClick
        />
      </Box>
    </Stack>
  )
}

export function TroubleVideos(): ReactElement {
  const [tab, setTab] = useState<TabValue>('languages')

  const handleTabChange = (
    _event: React.SyntheticEvent,
    value: TabValue
  ): void => {
    setTab(value)
  }

  return (
    <Stack spacing={3} sx={{ height: 'calc(100vh - 150px)', width: '100%' }}>
      <Stack spacing={1}>
        <Typography variant="h4">Trouble Videos</Typography>
        <Typography variant="body2" color="text.secondary">
          Library-wide consistency checks. Issues are recomputed each refresh —
          there is no persistence layer.
        </Typography>
      </Stack>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        aria-label="Trouble videos checks"
      >
        <Tab value="languages" label="Available Languages" />
        <Tab value="algoliaVideos" label="Algolia Video Drift" />
        <Tab value="algoliaVariants" label="Algolia Variant Drift" />
      </Tabs>
      {tab === 'languages' && <AvailableLanguagesPanel />}
      {tab === 'algoliaVideos' && <AlgoliaVideoDriftPanel />}
      {tab === 'algoliaVariants' && <AlgoliaVariantDriftPanel />}
    </Stack>
  )
}
