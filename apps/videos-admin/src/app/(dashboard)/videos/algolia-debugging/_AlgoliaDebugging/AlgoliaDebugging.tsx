'use client'

import { gql, useApolloClient, useMutation } from '@apollo/client'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel
} from '@mui/x-data-grid'
import NextLink from 'next/link'
import { useSnackbar } from 'notistack'
import { MouseEvent, ReactElement, useCallback, useMemo, useState } from 'react'

import { isStagingEnvironment } from '../../../../../libs/environment'

interface VariantIndexMismatch {
  field: string
  expected: string | null
  actual: string | null
}

interface VariantIndexIssue {
  id: string
  issueType: 'missing' | 'stale' | 'extra' | 'failed'
  variantId: string | null
  objectId: string
  videoId: string | null
  languageId: string | null
  languageName: string | null
  mismatches: VariantIndexMismatch[]
  error: string | null
}

interface BatchResult {
  scanType: 'core' | 'algolia'
  batchKey: string | null
  nextBatchKey: string | null
  done: boolean
  checkedCount: number
  missingCount: number
  staleCount: number
  extraCount: number
  failedCount: number
  issues: VariantIndexIssue[]
}

interface SummaryCounts {
  checked: number
  missing: number
  stale: number
  extra: number
  failed: number
}

const CHECK_VARIANT_INDEX_BATCH = gql`
  query CheckAlgoliaVideoVariantIndexBatch(
    $input: CheckAlgoliaVideoVariantIndexBatchInput!
  ) {
    checkAlgoliaVideoVariantIndexBatch(input: $input) {
      scanType
      batchKey
      nextBatchKey
      done
      checkedCount
      missingCount
      staleCount
      extraCount
      failedCount
      issues {
        id
        issueType
        variantId
        objectId
        videoId
        languageId
        languageName
        mismatches {
          field
          expected
          actual
        }
        error
      }
    }
  }
`

const FIX_VARIANT_INDEX_ISSUES = gql`
  mutation FixAlgoliaVideoVariantIndexIssues(
    $input: FixAlgoliaVideoVariantIndexIssuesInput!
  ) {
    fixAlgoliaVideoVariantIndexIssues(input: $input) {
      fixedCount
      failedCount
      issues {
        id
        issueType
        objectId
        error
      }
    }
  }
`

const BATCH_SIZE = 100
const ENGLISH_LANGUAGE_ID = '529'
const initialSummary: SummaryCounts = {
  checked: 0,
  missing: 0,
  stale: 0,
  extra: 0,
  failed: 0
}
const emptySelectionModel: GridRowSelectionModel = {
  type: 'include',
  ids: new Set()
}

function getIssueColor(issueType: VariantIndexIssue['issueType']) {
  switch (issueType) {
    case 'missing':
      return 'warning'
    case 'stale':
      return 'info'
    case 'extra':
      return 'secondary'
    case 'failed':
      return 'error'
  }
}

function getMismatchText(mismatches: VariantIndexMismatch[]): string {
  if (mismatches.length === 0) return 'none'
  return mismatches.map((mismatch) => mismatch.field).join(', ')
}

function mergeIssues(
  existingIssues: VariantIndexIssue[],
  nextIssues: VariantIndexIssue[]
): VariantIndexIssue[] {
  const byId = new Map(existingIssues.map((issue) => [issue.id, issue]))
  for (const issue of nextIssues) byId.set(issue.id, issue)
  return Array.from(byId.values())
}

function subtractFixedIssues(
  current: SummaryCounts,
  fixedIssues: VariantIndexIssue[]
): SummaryCounts {
  const fixedCounts = fixedIssues.reduce(
    (counts, issue) => ({
      missing: counts.missing + (issue.issueType === 'missing' ? 1 : 0),
      stale: counts.stale + (issue.issueType === 'stale' ? 1 : 0),
      extra: counts.extra + (issue.issueType === 'extra' ? 1 : 0),
      failed: counts.failed + (issue.issueType === 'failed' ? 1 : 0)
    }),
    { missing: 0, stale: 0, extra: 0, failed: 0 }
  )

  return {
    ...current,
    missing: Math.max(0, current.missing - fixedCounts.missing),
    stale: Math.max(0, current.stale - fixedCounts.stale),
    extra: Math.max(0, current.extra - fixedCounts.extra),
    failed: Math.max(0, current.failed - fixedCounts.failed)
  }
}

export function AlgoliaDebugging(): ReactElement {
  const apolloClient = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()
  const [fixIssues] = useMutation(FIX_VARIANT_INDEX_ISSUES)
  const [issues, setIssues] = useState<VariantIndexIssue[]>([])
  const [summary, setSummary] = useState<SummaryCounts>(initialSummary)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [selectionModel, setSelectionModel] =
    useState<GridRowSelectionModel>(emptySelectionModel)
  const [languageId, setLanguageId] = useState<string | null>(
    isStagingEnvironment() ? ENGLISH_LANGUAGE_ID : null
  )

  const selectedIssues = useMemo(() => {
    const selectedIds = new Set(Array.from(selectionModel.ids).map(String))
    return issues.filter((issue) => selectedIds.has(issue.id))
  }, [issues, selectionModel])

  const selectedFixableCounts = useMemo(
    () => ({
      missing: selectedIssues.filter((issue) => issue.issueType === 'missing')
        .length,
      stale: selectedIssues.filter((issue) => issue.issueType === 'stale')
        .length,
      extra: selectedIssues.filter((issue) => issue.issueType === 'extra')
        .length
    }),
    [selectedIssues]
  )
  const hasSelectedFixableIssues =
    selectedFixableCounts.missing > 0 ||
    selectedFixableCounts.stale > 0 ||
    selectedFixableCounts.extra > 0

  const applyBatch = useCallback((batch: BatchResult) => {
    setSummary((current) => ({
      checked: current.checked + batch.checkedCount,
      missing: current.missing + batch.missingCount,
      stale: current.stale + batch.staleCount,
      extra: current.extra + batch.extraCount,
      failed: current.failed + batch.failedCount
    }))
    setIssues((current) => mergeIssues(current, batch.issues))
  }, [])

  const runScanType = useCallback(
    async (scanType: 'core' | 'algolia') => {
      let batchKey: string | null = null
      let done = false

      while (!done) {
        const { data } = await apolloClient.query<{
          checkAlgoliaVideoVariantIndexBatch: BatchResult
        }>({
          query: CHECK_VARIANT_INDEX_BATCH,
          variables: {
            input: { scanType, batchKey, batchSize: BATCH_SIZE, languageId }
          },
          fetchPolicy: 'no-cache'
        })
        const batch = data.checkAlgoliaVideoVariantIndexBatch
        applyBatch(batch)
        batchKey = batch.nextBatchKey
        done = batch.done
      }
    },
    [apolloClient, applyBatch, languageId]
  )

  const handleLanguageFilterChange = useCallback(
    (_event: MouseEvent<HTMLElement>, value: string | null) => {
      if (value == null) return
      setLanguageId(value === 'english' ? ENGLISH_LANGUAGE_ID : null)
    },
    []
  )

  const handleStartScan = useCallback(async () => {
    setScanning(true)
    setScanError(null)
    setIssues([])
    setSummary(initialSummary)
    setSelectionModel(emptySelectionModel)

    try {
      await runScanType('core')
      await runScanType('algolia')
      enqueueSnackbar('Variant index check complete', { variant: 'success' })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setScanError(message)
      enqueueSnackbar('Variant index check failed', { variant: 'error' })
    } finally {
      setScanning(false)
    }
  }, [enqueueSnackbar, runScanType])

  const handleFix = useCallback(
    async (
      issueType: 'missing' | 'stale' | 'extra',
      objectIds: string[]
    ): Promise<void> => {
      const result = await fixIssues({
        variables: { input: { issueType, objectIds } }
      })
      const fixedCount =
        result.data?.fixAlgoliaVideoVariantIndexIssues?.fixedCount ?? 0
      const failedCount =
        result.data?.fixAlgoliaVideoVariantIndexIssues?.failedCount ?? 0
      const failedIds = new Set(
        (result.data?.fixAlgoliaVideoVariantIndexIssues?.issues ?? []).map(
          (issue: { objectId: string }) => issue.objectId
        )
      )
      const fixedIds = new Set(
        objectIds.filter((objectId) => !failedIds.has(objectId))
      )

      if (fixedIds.size > 0) {
        const fixedIssues = issues.filter((issue) =>
          fixedIds.has(issue.objectId)
        )
        setIssues((current) =>
          current.filter((issue) => !fixedIds.has(issue.objectId))
        )
        setSummary((current) => subtractFixedIssues(current, fixedIssues))
        setSelectionModel((current) => ({
          ...current,
          ids: new Set(
            Array.from(current.ids).filter((id) => !fixedIds.has(String(id)))
          )
        }))
      }

      enqueueSnackbar(
        failedCount > 0
          ? `Fixed ${fixedCount}; ${failedCount} failed`
          : `Fixed ${fixedCount}`,
        { variant: failedCount > 0 ? 'warning' : 'success' }
      )
    },
    [enqueueSnackbar, fixIssues, issues]
  )

  const handleFixSelected = useCallback(
    async (issueType: 'missing' | 'stale' | 'extra') => {
      const objectIds = selectedIssues
        .filter((issue) => issue.issueType === issueType)
        .map((issue) => issue.objectId)
      await handleFix(issueType, objectIds)
    },
    [handleFix, selectedIssues]
  )

  const columns = useMemo<GridColDef<VariantIndexIssue>[]>(
    () => [
      {
        field: 'issueType',
        headerName: 'Issue',
        width: 120,
        renderCell: ({ row }: GridRenderCellParams<VariantIndexIssue>) => (
          <Chip
            size="small"
            label={row.issueType}
            color={getIssueColor(row.issueType)}
          />
        )
      },
      { field: 'objectId', headerName: 'Object ID', width: 220 },
      {
        field: 'videoId',
        headerName: 'Video ID',
        width: 180,
        renderCell: ({ row }: GridRenderCellParams<VariantIndexIssue>) =>
          row.videoId != null ? (
            <Link component={NextLink} href={`/videos/${row.videoId}`}>
              {row.videoId}
            </Link>
          ) : (
            'none'
          )
      },
      { field: 'languageId', headerName: 'Language ID', width: 120 },
      { field: 'languageName', headerName: 'Language', width: 160 },
      {
        field: 'mismatches',
        headerName: 'Mismatches',
        flex: 1,
        minWidth: 180,
        valueGetter: (_value, row) => getMismatchText(row.mismatches)
      },
      {
        field: 'error',
        headerName: 'Error',
        flex: 1,
        minWidth: 180,
        valueGetter: (_value, row) => row.error ?? 'none'
      },
      {
        field: 'actions',
        headerName: '',
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: ({ row }: GridRenderCellParams<VariantIndexIssue>) =>
          row.issueType === 'missing' ||
          row.issueType === 'stale' ||
          row.issueType === 'extra' ? (
            <Button
              size="small"
              startIcon={<BuildRoundedIcon />}
              onClick={() =>
                void handleFix(row.issueType as 'missing' | 'stale' | 'extra', [
                  row.objectId
                ])
              }
            >
              Fix
            </Button>
          ) : null
      }
    ],
    [handleFix]
  )

  return (
    <Stack
      spacing={2}
      sx={{
        p: 3,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        height: 'calc(100vh - 112px)'
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', lg: 'center' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            disabled={scanning}
            value={languageId === ENGLISH_LANGUAGE_ID ? 'english' : 'all'}
            onChange={handleLanguageFilterChange}
          >
            <ToggleButton value="english">English</ToggleButton>
            <ToggleButton value="all">All variants</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<PlayArrowRoundedIcon />}
            disabled={scanning}
            onClick={() => void handleStartScan()}
          >
            {scanning ? 'Checking' : 'Start Variant Check'}
          </Button>
        </Stack>

        {hasSelectedFixableIssues && (
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            {selectedFixableCounts.missing > 0 && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<BuildRoundedIcon />}
                disabled={scanning}
                onClick={() => void handleFixSelected('missing')}
              >
                Fix missing ({selectedFixableCounts.missing})
              </Button>
            )}
            {selectedFixableCounts.stale > 0 && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<BuildRoundedIcon />}
                disabled={scanning}
                onClick={() => void handleFixSelected('stale')}
              >
                Fix stale ({selectedFixableCounts.stale})
              </Button>
            )}
            {selectedFixableCounts.extra > 0 && (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<BuildRoundedIcon />}
                disabled={scanning}
                onClick={() => void handleFixSelected('extra')}
              >
                Delete extra ({selectedFixableCounts.extra})
              </Button>
            )}
          </Stack>
        )}
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={1}>
        <Chip label={`Checked ${summary.checked}`} />
        <Chip color="warning" label={`Missing ${summary.missing}`} />
        <Chip color="info" label={`Stale ${summary.stale}`} />
        <Chip color="secondary" label={`Extra ${summary.extra}`} />
        <Chip color="error" label={`Failed ${summary.failed}`} />
      </Stack>

      {scanning && <LinearProgress />}
      {scanError != null && <Alert severity="error">{scanError}</Alert>}

      <Box sx={{ flexGrow: 1, minHeight: 360, width: '100%', minWidth: 0 }}>
        <DataGrid
          rows={issues}
          columns={columns}
          checkboxSelection
          disableRowSelectionOnClick
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={setSelectionModel}
          getRowId={(row) => row.id}
          pageSizeOptions={[25, 50, 100]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } }
          }}
          localeText={{ noRowsLabel: 'No variant index issues' }}
        />
      </Box>

      <Typography variant="caption" color="text.secondary">
        Results are kept in this browser tab.
      </Typography>
    </Stack>
  )
}
