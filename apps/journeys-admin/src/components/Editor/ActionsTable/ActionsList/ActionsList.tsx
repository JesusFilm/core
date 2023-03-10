import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { ActionFields_LinkAction as LinkAction } from '../../../../../__generated__/ActionFields'

interface ActionsListProps {
  actions: LinkAction[]
}

export function ActionsList({ actions }: ActionsListProps): ReactElement {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Link</TableCell>
            <TableCell>Goal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {actions?.map((action, i) => (
            <TableRow key={i}>
              <TableCell>
                <Typography>{action.url}</Typography>
              </TableCell>
              <TableCell>
                <Typography>goal</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
