import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import EditRounded from '@mui/icons-material/EditRounded'
import QuestionAnswerOutlined from '@mui/icons-material/QuestionAnswerOutlined'
import WebOutlined from '@mui/icons-material/WebOutlined'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import { useTheme } from '@mui/material/styles'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import Stack from '@mui/material/Stack'
import Box from '@mui/system/Box'
import Button from '@mui/material/Button'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
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

  const handleClick = (url: string): void => {
    dispatch({
      type: 'SetDrawerPropsAction',
      mobileOpen: true,
      title: 'Goal Details',
      children: <ActionDetails url={url} />
    })
  }

  return (
    <Stack
      sx={{
        gap: 4,
        [theme.breakpoints.up('md')]: {
          mx: 10,
          gap: 12
        }
      }}
    >
      <Box
        sx={{
          [theme.breakpoints.down('md')]: {
            mx: 6
          }
        }}
      >
        <Box
          sx={{
            pb: 3,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            [theme.breakpoints.down('md')]: {
              flexDirection: 'column-reverse'
            }
          }}
        >
          <Typography variant="h1">Your Goals</Typography>
          <Button
            variant="outlined"
            startIcon={<InfoOutlined sx={{ color: 'secondary.light' }} />}
            sx={{
              display: 'flex',
              color: 'secondary.main',
              borderColor: 'secondary.main',
              borderRadius: 2,
              [theme.breakpoints.down('md')]: {
                alignSelf: 'end',
                mb: 4
              }
            }}
          >
            <Typography variant="subtitle2">Learn More</Typography>
          </Button>
        </Box>
        <Typography>
          You can change them to your own clicking on the rows of this table
        </Typography>
      </Box>

      {/* desktop view */}
      <TableContainer
        component={Paper}
        sx={{ [theme.breakpoints.down('md')]: { display: 'none' } }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>
                <Typography variant="subtitle2">Target and Action</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2">Appears on</Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {actions?.map(({ url, count }, i) => (
              <TableRow key={i} onClick={() => handleClick(url)}>
                <TableCell align="center">
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
                <TableCell>
                  <EditRounded sx={{ color: 'divider' }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* mobiel view */}
      <TableContainer
        component={Paper}
        sx={{
          [theme.breakpoints.up('md')]: {
            display: 'none',
            borderRadius: undefined
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">Target and Action</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actions?.map(({ url, count }, i) => (
              <TableRow key={i} onClick={() => handleClick(url)}>
                <TableCell>
                  <Stack gap={2}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        width: '300px'
                      }}
                    >
                      {url}
                    </Typography>
                    <Stack gap={2} direction="row">
                      <GoalIcon url={url} />
                      <Typography variant="subtitle2">
                        {goalLabel(url)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="secondary.light">
                      Appears on{' '}
                      <span style={{ fontWeight: 'bold' }}>{count}</span>{' '}
                      {count > 1 ? 'cards' : 'card'}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
