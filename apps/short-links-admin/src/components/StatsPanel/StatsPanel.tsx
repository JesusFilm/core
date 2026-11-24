'use client'

import { useQuery } from '@apollo/client/react'
import { DownloadIcon } from 'lucide-react'
import { ReactElement, useMemo } from 'react'

import { graphql } from '@core/shared/gql'

import { downloadCsv, toCsv } from '../../libs/csv'
import { SHORT_LINK_STATS_FIELDS, lastThirtyDays } from '../../libs/shortLink'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardPanel } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

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

function StatTile({
  label,
  value
}: {
  label: string
  value: number
}): ReactElement {
  return (
    <div className="bg-card min-w-28 flex-1 rounded-lg border p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="text-2xl font-semibold">
        {value.toLocaleString('en-US')}
      </div>
    </div>
  )
}

function ByDayBars({ points }: { points: StatsPoint[] }): ReactElement {
  const max = Math.max(1, ...points.map((point) => point.count))

  if (points.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No scans in this period.</p>
    )
  }

  return (
    <div
      role="img"
      aria-label="Scans by day"
      data-testid="StatsByDay"
      className="flex h-32 items-end gap-0.5"
    >
      {points.map((point) => (
        <div
          key={point.key}
          title={`${point.key}: ${point.count} scans (${point.qrCount} QR)`}
          className="bg-primary min-w-1 flex-1 rounded-sm transition-[height]"
          style={{ height: `${Math.max(2, (point.count / max) * 100)}%` }}
        />
      ))}
    </div>
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
    <div className="min-w-56 flex-1">
      <h4 className="mb-2 text-sm font-medium">{title}</h4>
      <Table aria-label={title}>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead className="text-right">Scans</TableHead>
            <TableHead className="text-right">QR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {points.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground">
                No data
              </TableCell>
            </TableRow>
          )}
          {points.map((point) => (
            <TableRow key={point.key}>
              <TableCell>{point.key === '' ? 'Unknown' : point.key}</TableCell>
              <TableCell className="text-right">{point.count}</TableCell>
              <TableCell className="text-right">{point.qrCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
    <Card data-testid="StatsPanel" className="w-full">
      <CardPanel className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Scans</h3>
            <p className="text-muted-foreground text-xs">
              {range.from.slice(0, 10)} to {range.to.slice(0, 10)}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={stats == null}
          >
            <DownloadIcon aria-hidden="true" />
            Export CSV
          </Button>
        </div>
        {loading && <Spinner aria-label="Loading scans" />}
        {error != null && (
          <Alert variant="error">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        {stats != null && (
          <div className="flex flex-col gap-6">
            <div className="flex gap-3">
              <StatTile label="Total" value={stats.total} />
              <StatTile label="QR" value={stats.qr} />
              <StatTile label="Direct" value={stats.direct} />
            </div>
            <ByDayBars points={stats.byDay} />
            <div className="flex flex-col gap-6 md:flex-row">
              <BreakdownTable title="By country" points={stats.byCountry} />
              <BreakdownTable title="By device" points={stats.byDeviceClass} />
            </div>
          </div>
        )}
      </CardPanel>
    </Card>
  )
}
