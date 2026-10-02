import { ReactElement } from 'react'

import { DateLike, formatDateTime } from '../../libs/shortLink'

import { Card, CardPanel } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

export interface DestinationHistoryEntry {
  id: string
  from: string
  to: string
  changedBy?: string | null
  changedAt: DateLike
  note?: string | null
}

interface DestinationHistoryTableProps {
  history: DestinationHistoryEntry[]
}

export function DestinationHistoryTable({
  history
}: DestinationHistoryTableProps): ReactElement {
  return (
    <Card data-testid="DestinationHistory" className="w-full">
      <CardPanel className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Destination history</h3>
        {history.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            The destination has not changed since this link was created.
          </p>
        ) : (
          <Table aria-label="Destination history">
            <TableHeader>
              <TableRow>
                <TableHead>Changed</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDateTime(entry.changedAt)}
                  </TableCell>
                  <TableCell className="break-all">
                    <a
                      href={entry.from}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-4 hover:underline"
                    >
                      {entry.from}
                    </a>
                  </TableCell>
                  <TableCell className="break-all">
                    <a
                      href={entry.to}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-4 hover:underline"
                    >
                      {entry.to}
                    </a>
                  </TableCell>
                  <TableCell>{entry.changedBy ?? ''}</TableCell>
                  <TableCell>{entry.note ?? ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardPanel>
    </Card>
  )
}
