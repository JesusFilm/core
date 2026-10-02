'use client'

import { gql, useMutation, useQuery } from '@apollo/client'
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
import { ReactElement, useState } from 'react'

const PROCESSING_STATUSES = gql`
  query ProcessingStatuses(
    $status: VideoVariantReconciliationStatus
    $blockingStage: VideoVariantProcessingStage
    $olderThan: DateTime
    $minRetryCount: Int
  ) {
    videoVariantReconciliations(
      status: $status
      blockingStage: $blockingStage
      olderThan: $olderThan
      minRetryCount: $minRetryCount
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
  const [status, setStatus] = useState('')
  const [blockingStage, setBlockingStage] = useState('')
  const [olderThan, setOlderThan] = useState('')
  const [minRetryCount, setMinRetryCount] = useState('')
  const { data, loading, refetch } = useQuery<ProcessingStatusesData>(
    PROCESSING_STATUSES,
    {
      variables: {
        status: status || undefined,
        blockingStage: blockingStage || undefined,
        olderThan: olderThan ? new Date(olderThan).toISOString() : undefined,
        minRetryCount: minRetryCount ? Number(minRetryCount) : undefined
      },
      pollInterval: 30_000
    }
  )
  const [retryProcessing, { loading: retrying }] = useMutation(RETRY_PROCESSING)

  const handleRetry = async (id: string): Promise<void> => {
    await retryProcessing({ variables: { id } })
    await refetch()
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
            onChange={(event) => setStatus(event.target.value)}
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
            onChange={(event) => setBlockingStage(event.target.value)}
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
          onChange={(event) => setOlderThan(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          label="Minimum retries"
          type="number"
          value={minRetryCount}
          onChange={(event) => setMinRetryCount(event.target.value)}
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
                    disabled={retrying || reconciliation.status === 'complete'}
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
    </Stack>
  )
}
