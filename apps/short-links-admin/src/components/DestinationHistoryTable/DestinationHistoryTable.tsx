import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { DateLike, formatDateTime } from '../../libs/shortLink'

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
    <Paper sx={{ p: 2, width: '100%' }} data-testid="DestinationHistory">
      <Typography component="h3" variant="h6" sx={{ mb: 1 }}>
        Destination history
      </Typography>
      {history.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          The destination has not changed since this link was created.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small" aria-label="Destination history">
            <TableHead>
              <TableRow>
                <TableCell>Changed</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell>By</TableCell>
                <TableCell>Note</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDateTime(entry.changedAt)}
                  </TableCell>
                  <TableCell sx={{ wordBreak: 'break-all' }}>
                    <Link href={entry.from} target="_blank" rel="noreferrer">
                      {entry.from}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ wordBreak: 'break-all' }}>
                    <Link href={entry.to} target="_blank" rel="noreferrer">
                      {entry.to}
                    </Link>
                  </TableCell>
                  <TableCell>{entry.changedBy ?? ''}</TableCell>
                  <TableCell>{entry.note ?? ''}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}
