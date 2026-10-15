'use client'

import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

const PAGE_SIZE = 50

const PROCESSING_STATUSES = gql`
  query ProcessingStatuses(
    $status: VideoVariantReconciliationStatus
    $blockingStage: VideoVariantProcessingStage
    $olderThan: DateTime
    $minRetryCount: Int
    $offset: Int
    $limit: Int
  ) {
    videoVariantReconciliations(
      status: $status
      blockingStage: $blockingStage
      olderThan: $olderThan
      minRetryCount: $minRetryCount
      offset: $offset
      limit: $limit
    ) {
      id
      status
      videoId
      videoVariantId
      processingStages
      errorMessage
      updatedAt
    }
  }
`

const RETRY_PROCESSING = gql`
  mutation RetryProcessing($id: ID!) {
    videoVariantReconciliationRetry(id: $id) {
      id
      status
    }
  }
`

type ProcessingStage = {
  state?: string
  attempts?: number
}

type ProcessingStatus = {
  id: string
  status: string
  videoId: string
  videoVariantId: string | null
  processingStages: string
  errorMessage: string | null
  updatedAt: string
}

type ProcessingStatusesData = {
  videoVariantReconciliations: ProcessingStatus[]
}

const RETRYABLE_STATUSES = ['degraded', 'failed']

function stageSummary(processingStages: string): string {
  try {
    const stages = JSON.parse(processingStages) as Record<
      string,
      ProcessingStage
    >
    return Object.entries(stages)
      .filter(([, stage]) =>
        ['failed', 'processing', 'unknown'].includes(stage.state ?? '')
      )
      .map(
        ([name, stage]) =>
          `${name}: ${stage.state ?? 'unknown'} (${stage.attempts ?? 0})`
      )
      .join(' · ')
  } catch {
    return 'Status details unavailable'
  }
}

export function ProcessingStatusList(): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [status, setStatus] = useState('')
  const [blockingStage, setBlockingStage] = useState('')
  const [olderThan, setOlderThan] = useState('')
  const [minRetryCount, setMinRetryCount] = useState('')
  const [offset, setOffset] = useState(0)
  const { data, loading, error, refetch } = useQuery<ProcessingStatusesData>(
    PROCESSING_STATUSES,
    {
      variables: {
        status: status || undefined,
        blockingStage: blockingStage || undefined,
        olderThan: olderThan ? new Date(olderThan).toISOString() : undefined,
        // Server rejects minRetryCount without blockingStage; the field is
        // also disabled below, but guard the request in case state is stale.
        minRetryCount:
          blockingStage && minRetryCount ? Number(minRetryCount) : undefined,
        offset,
        limit: PAGE_SIZE
      },
      pollInterval: 30_000
    }
  )
  const resultCount = data?.videoVariantReconciliations.length ?? 0
  const hasPreviousPage = offset > 0
  const hasNextPage = resultCount === PAGE_SIZE

  const updateFilter = (apply: () => void): void => {
    apply()
    setOffset(0)
  }
  const [retryProcessing, { loading: retrying }] = useMutation(RETRY_PROCESSING)

  const handleRetry = async (id: string): Promise<void> => {
    try {
      await retryProcessing({ variables: { id } })
    } catch {
      enqueueSnackbar('Failed to retry processing', { variant: 'error' })
      return
    }
    // Retry already succeeded server-side; a refetch blip shouldn't be
    // reported as a failed retry. The poll interval will pick up the new state.
    await refetch().catch(() => undefined)
  }

  return (
    <Stack spacing={3} sx={{ py: 3 }}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Variant processing</Typography>
        <Typography color="text.secondary">
          Canonical Upload health, publication blockers, and monitored Download
          failures.
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="health-filter-label">Health</InputLabel>
          <Select
            labelId="health-filter-label"
            label="Health"
            value={status}
            onChange={(event) =>
              updateFilter(() => setStatus(event.target.value))
            }
          >
            <MenuItem value="">All</MenuItem>
            {['processing', 'degraded', 'complete', 'failed'].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="stage-filter-label">Blocking stage</InputLabel>
          <Select
            labelId="stage-filter-label"
            label="Blocking stage"
            value={blockingStage}
            onChange={(event) =>
              updateFilter(() => setBlockingStage(event.target.value))
            }
          >
            <MenuItem value="">Any</MenuItem>
            {[
              'mux',
              'parentSync',
              'downloads',
              'algoliaVideo',
              'algoliaVariant'
            ].map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Older than"
          type="datetime-local"
          value={olderThan}
          onChange={(event) =>
            updateFilter(() => setOlderThan(event.target.value))
          }
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          label="Minimum retries"
          type="number"
          value={minRetryCount}
          onChange={(event) =>
            updateFilter(() => setMinRetryCount(event.target.value))
          }
          disabled={!blockingStage}
          helperText={
            !blockingStage ? 'Choose a blocking stage first' : undefined
          }
          slotProps={{ htmlInput: { min: 0 } }}
        />
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table aria-label="Variant processing statuses">
          <TableHead>
            <TableRow>
              <TableCell>Health</TableCell>
              <TableCell>Variant</TableCell>
              <TableCell>Stages</TableCell>
              <TableCell>Latest error</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}
            {!loading && error && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="error">
                    Failed to load processing statuses: {error.message}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {data?.videoVariantReconciliations.map((reconciliation) => (
              <TableRow key={reconciliation.id} hover>
                <TableCell>
                  <Chip
                    size="small"
                    label={reconciliation.status}
                    color={
                      reconciliation.status === 'complete'
                        ? 'success'
                        : reconciliation.status === 'processing'
                          ? 'info'
                          : 'warning'
                    }
                  />
                </TableCell>
                <TableCell>
                  {reconciliation.videoVariantId ?? reconciliation.videoId}
                </TableCell>
                <TableCell>
                  {stageSummary(reconciliation.processingStages)}
                </TableCell>
                <TableCell>{reconciliation.errorMessage ?? '—'}</TableCell>
                <TableCell>
                  {new Date(reconciliation.updatedAt).toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    disabled={
                      retrying ||
                      !RETRYABLE_STATUSES.includes(reconciliation.status)
                    }
                    onClick={() => void handleRetry(reconciliation.id)}
                  >
                    Retry processing
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          size="small"
          disabled={!hasPreviousPage}
          onClick={() =>
            setOffset((previous) => Math.max(0, previous - PAGE_SIZE))
          }
        >
          Previous
        </Button>
        <Button
          size="small"
          disabled={!hasNextPage}
          onClick={() => setOffset((previous) => previous + PAGE_SIZE)}
        >
          Next
        </Button>
      </Stack>
    </Stack>
  )
}
