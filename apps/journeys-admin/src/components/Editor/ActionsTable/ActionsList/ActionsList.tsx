import { ReactElement, useEffect } from 'react'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import EditRounded from '@mui/icons-material/EditRounded'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActionFields_LinkAction as LinkAction } from '../../../../../__generated__/ActionFields'
import { ActionDetails } from '../../ActionDetails'

interface ActionsListProps {
  actions: LinkAction[]
}

export function ActionsList({ actions }: ActionsListProps): ReactElement {
  const { dispatch } = useEditor()

  useEffect(() => {
    dispatch({
      type: 'SetDrawerPropsAction',
      mobileOpen: true,
      children: <ActionDetails url={actions[0]?.url} />
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
              <TableCell>
                <IconButton
                  onClick={() => {
                    dispatch({
                      type: 'SetDrawerPropsAction',
                      mobileOpen: true,
                      children: <ActionDetails url={action.url} />
                    })
                  }}
                >
                  <EditRounded />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
