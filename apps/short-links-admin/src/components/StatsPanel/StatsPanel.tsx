'use client'

import { useQuery } from '@apollo/client/react'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ReactElement, useMemo } from 'react'

import { graphql } from '@core/shared/gql'

import { downloadCsv, toCsv } from '../../libs/csv'
import { SHORT_LINK_STATS_FIELDS, lastThirtyDays } from '../../libs/shortLink'

export const GET_SHORT_LINK_STATS = graphql(
  `
    query GetShortLinkStats($filter: ShortLinkStatsFilter!) {
      shortLinkStats(filter: $filter) {
        ...ShortLinkStatsFields
      }
    }
  `,
  [SHORT_LINK_STATS_FIELDS]
)

export interface StatsPoint {
  key: string
  count: number
  qrCount: number
}

interface StatsPanelProps {
  linkId?: string
  campaignId?: string
  from?: string
  to?: string
  csvFilename: string
}

const Bar = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 4,
  borderRadius: 2,
  backgroundColor: theme.palette.primary.main,
  transition: 'height 200ms'
}))

function StatTile({
  label,
  value
}: {
  label: string
  value: number
}): ReactElement {
  return (
    <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 120 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="h5">{value.toLocaleString('en-US')}</Typography>
    </Paper>
  )
}

function ByDayBars({ points }: { points: StatsPoint[] }): ReactElement {
  const max = Math.max(1, ...points.map((point) => point.count))

  if (points.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        No scans in this period.
      </Typography>
    )
  }

  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={{ alignItems: 'flex-end', height: 120 }}
      role="img"
      aria-label="Scans by day"
      data-testid="StatsByDay"
    >
      {points.map((point) => (
        <Tooltip
          key={point.key}
          title={`${point.key}: ${point.count} scans (${point.qrCount} QR)`}
        >
          <Bar sx={{ height: `${Math.max(2, (point.count / max) * 100)}%` }} />
        </Tooltip>
      ))}
    </Stack>
  )
}

function BreakdownTable({
  title,
  points
}: {
  title: string
  points: StatsPoint[]
}): ReactElement {
  return (
    <Box sx={{ flex: 1, minWidth: 220 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Table size="small" aria-label={title}>
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell align="right">Scans</TableCell>
            <TableCell align="right">QR</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {points.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} sx={{ color: 'text.secondary' }}>
                No data
              </TableCell>
            </TableRow>
          )}
          {points.map((point) => (
            <TableRow key={point.key}>
              <TableCell>{point.key === '' ? 'Unknown' : point.key}</TableCell>
              <TableCell align="right">{point.count}</TableCell>
              <TableCell align="right">{point.qrCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

export function StatsPanel({
  linkId,
  campaignId,
  from,
  to,
  csvFilename
}: StatsPanelProps): ReactElement {
  const range = useMemo(() => {
    const fallback = lastThirtyDays()
    return { from: from ?? fallback.from, to: to ?? fallback.to }
  }, [from, to])

  const { data, loading, error } = useQuery(GET_SHORT_LINK_STATS, {
    variables: { filter: { linkId, campaignId, ...range } }
  })

  const stats = data?.shortLinkStats

  function handleExport(): void {
    if (stats == null) return
    downloadCsv(
      csvFilename,
      toCsv<StatsPoint>(stats.byDay, [
        { header: 'Day', value: (point) => point.key },
        { header: 'Scans', value: (point) => point.count },
        { header: 'QR scans', value: (point) => point.qrCount },
        { header: 'Direct', value: (point) => point.count - point.qrCount }
      ])
    )
  }

  return (
    <Paper sx={{ p: 2, width: '100%' }} data-testid="StatsPanel">
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
      >
        <Box>
          <Typography component="h3" variant="h6">
            Scans
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {range.from.slice(0, 10)} to {range.to.slice(0, 10)}
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<DownloadRoundedIcon />}
          onClick={handleExport}
          disabled={stats == null}
        >
          Export CSV
        </Button>
      </Stack>
      {loading && <CircularProgress size={24} />}
      {error != null && <Alert severity="error">{error.message}</Alert>}
      {stats != null && (
        <Stack spacing={3}>
          <Stack direction="row" spacing={2}>
            <StatTile label="Total" value={stats.total} />
            <StatTile label="QR" value={stats.qr} />
            <StatTile label="Direct" value={stats.direct} />
          </Stack>
          <ByDayBars points={stats.byDay} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <BreakdownTable title="By country" points={stats.byCountry} />
            <BreakdownTable title="By device" points={stats.byDeviceClass} />
          </Stack>
        </Stack>
      )}
    </Paper>
  )
}
