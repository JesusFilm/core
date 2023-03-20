import { ReactElement } from 'react'
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
import QuestionAnswerOutlined from '@mui/icons-material/QuestionAnswerOutlined'
import WebOutlined from '@mui/icons-material/WebOutlined'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import { useTheme } from '@mui/material/styles'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActionDetails } from '../../ActionDetails'
import type { Actions } from '../ActionsTable'

interface ActionsListProps {
  actions: Actions[]
  goalLabel: (url: string) => string
}

export function ActionsList({
  actions,
  goalLabel
}: ActionsListProps): ReactElement {
  const { dispatch } = useEditor()
  const theme = useTheme()

  const GoalIcon = ({ url }: { url: string }): ReactElement => {
    switch (goalLabel(url)) {
      case 'Start a Conversation':
        return <QuestionAnswerOutlined sx={{ color: 'secondary.light' }} />
      case 'Link to Bible':
        return <MenuBookRounded sx={{ color: 'secondary.light' }} />
      case 'Visit a Website':
        return <WebOutlined sx={{ color: 'secondary.light' }} />
      default:
        return <></>
    }
  }

  return (
    <>
      <Typography variant="h1" gutterBottom>
        This Journey has goals
      </Typography>
      <Typography>
        You can change them to your own clicking on the rows of this table
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead
            sx={{
              [theme.breakpoints.down('md')]: { display: 'none', width: '100%' }
            }}
          >
            <TableRow>
              <TableCell sx={{ width: 75 }} />
              <TableCell>
                <Typography variant="subtitle2">Target and Action</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2">Appears on</Typography>
              </TableCell>
              <TableCell sx={{ width: 75 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {actions?.map(({ url, count }, i) => (
              <TableRow key={i}>
                <TableCell align="center" sx={{ width: 75 }}>
                  <GoalIcon url={url} />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{url}</Typography>
                  <Typography variant="body2">{goalLabel(url)}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2">{count}</Typography>
                  <Typography variant="body2">
                    {count > 1 ? 'cards' : 'card'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: 75 }}>
                  <IconButton
                    onClick={() => {
                      dispatch({
                        type: 'SetDrawerPropsAction',
                        mobileOpen: true,
                        title: 'Goal Details',
                        children: <ActionDetails url={url} />
                      })
                    }}
                  >
                    <EditRounded sx={{ color: 'divider' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}
