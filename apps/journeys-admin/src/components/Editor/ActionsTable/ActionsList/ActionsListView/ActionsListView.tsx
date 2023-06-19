import { ReactElement } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableRow, { TableRowProps } from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Stack from '@mui/material/Stack'
import TableHead from '@mui/material/TableHead'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { styled, Theme } from '@mui/material/styles'
import EditRounded from '@mui/icons-material/EditRounded'
import QuestionAnswerOutlined from '@mui/icons-material/QuestionAnswerOutlined'
import WebOutlined from '@mui/icons-material/WebOutlined'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Action, ActionType } from '../../utils/getActions'

interface ActionsListViewProps {
  actions: Action[]
  selectedAction?: Action
  goalLabel: (url: string) => string
  handleClick: (url: string, actionType: ActionType) => void
}

// tested in ActionList
export function ActionsListView({
  actions,
  goalLabel,
  selectedAction,
  handleClick
}: ActionsListViewProps): ReactElement {
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const GoalIcon = ({
    url,
    actionType
  }: {
    url: string
    actionType: ActionType
  }): ReactElement => {
    const color =
      selectedAction?.url === url && selectedAction?.actionType === actionType
        ? 'primary.main'
        : 'secondary.light'
    switch (goalLabel(url)) {
      case 'Start a Conversation':
        return <QuestionAnswerOutlined sx={{ color }} />
      case 'Link to Bible':
        return <MenuBookRounded sx={{ color }} />
      case 'Visit a Website':
        return <WebOutlined sx={{ color }} />
      default:
        return <></>
    }
  }

  return (
    <>
      {/* desktop view */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 'none',
          border: '1px solid #DEDFE0',
          backgroundColor: 'transparent',
          display: mdUp ? 'block' : 'none'
        }}
      >
        <Table>
          <TableHead sx={{ borderBottom: '1.5px solid #DEDFE0' }}>
            <TableRow sx={{ backgroundColor: 'background.paper' }}>
              <TableCell width={60} />
              <TableCell>
                <Typography variant="subtitle2">Target and Action</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" align="center" width={100}>
                  Appears on{' '}
                </Typography>
              </TableCell>
              <TableCell width={50} />
            </TableRow>
          </TableHead>
          <TableBody>
            {actions?.map(({ url, count, actionType }, index) => (
              <StyledTableRow
                key={index}
                onClick={() => handleClick(url, actionType)}
                selectedAction={
                  selectedAction?.url === url &&
                  selectedAction?.actionType === actionType
                }
              >
                <TableCell width={0} align="center" sx={{ pr: 2, pl: 5 }}>
                  <GoalIcon url={url} actionType={actionType} />
                </TableCell>
                <TableCell
                  sx={{
                    maxWidth: 0,
                    width: '100%',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color={
                      selectedAction?.url === url &&
                      selectedAction?.actionType === actionType
                        ? 'secondary.dark'
                        : 'text.primary'
                    }
                    sx={{
                      pb: 1
                    }}
                  >
                    {url}
                  </Typography>
                  <Typography variant="subtitle2" color="secondary.light">
                    {goalLabel(url)}
                  </Typography>
                </TableCell>
                <TableCell align="center" width={100}>
                  <Typography variant="subtitle2">
                    {actionType === 'chatButton' ? 'All' : count}
                  </Typography>
                  <Typography variant="body2">
                    {count > 1 || actionType === 'chatButton'
                      ? 'cards'
                      : 'card'}
                  </Typography>
                </TableCell>
                <TableCell width={40} sx={{ pl: 0, pr: 5 }}>
                  <EditRounded
                    sx={{
                      color:
                        selectedAction?.url === url &&
                        selectedAction?.actionType === actionType
                          ? 'primary.main'
                          : 'background.default'
                    }}
                  />
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* mobile view */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid #DEDFE0',
          display: mdUp ? 'none' : 'block'
        }}
      >
        <Table>
          <TableHead sx={{ borderBottom: '1.5px solid #DEDFE0' }}>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">Target and Action</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actions?.map(({ url, count, actionType }, index) => (
              <StyledTableRow
                key={index}
                onClick={() => handleClick(url, actionType)}
                selectedAction={
                  selectedAction?.url === url &&
                  selectedAction?.actionType === actionType
                }
              >
                <TableCell>
                  <Stack gap={2}>
                    <Typography
                      variant="subtitle2"
                      color={
                        selectedAction?.url === url &&
                        selectedAction?.actionType === actionType
                          ? 'secondary.dark'
                          : 'text.primary'
                      }
                      sx={{
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        width: '300px'
                      }}
                    >
                      {url}
                    </Typography>
                    <Stack gap={2} direction="row" alignItems="center" pb={2.5}>
                      <GoalIcon url={url} actionType={actionType} />
                      <Typography variant="subtitle2" color="secondary.light">
                        {goalLabel(url)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="secondary.light">
                      Appears on{' '}
                      <span style={{ fontWeight: 'bold' }}>
                        {actionType === 'chatButton' ? 'All' : count}
                      </span>{' '}
                      {count > 1 || actionType === 'chatButton'
                        ? 'cards'
                        : 'card'}
                    </Typography>
                  </Stack>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

interface StyledTableRowProps extends TableRowProps {
  selectedAction?: boolean
}

const StyledTableRow = styled(TableRow)<StyledTableRowProps>(
  ({ theme, selectedAction }) => ({
    cursor: 'pointer',
    ...(selectedAction === true
      ? {
          borderBottom: '1.5px solid #C52D3A',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          '&:last-child': {
            borderBottom: '1.5px solid #C52D3A'
          }
        }
      : {
          borderBottom: '1.5px solid #DEDFE0',
          backgroundColor: theme.palette.background.paper,
          '&:last-child': {
            borderBottom: 'none'
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }
        }),
    transition: 'border-color 0.1s ease-in-out'
  })
)
