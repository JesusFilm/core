import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { Theme, styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow, { TableRowProps } from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import BibleIcon from '@core/shared/ui/icons/Bible'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import LinkAngledIcon from '@core/shared/ui/icons/LinkAngled'
import MessageChat1Icon from '@core/shared/ui/icons/MessageChat1'

import type { Actions } from '../../ActionsTable'

interface ActionsListViewProps {
  actions: Actions[]
  selectedAction?: string
  goalLabel: (url: string) => string
  handleClick: (url: string) => void
}

// tested in ActionList
export function ActionsListView({
  actions,
  goalLabel,
  selectedAction,
  handleClick
}: ActionsListViewProps): ReactElement {
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
  const { t } = useTranslation('apps-journeys-admin')

  const GoalIcon = ({ url }: { url: string }): ReactElement => {
    const color = selectedAction === url ? 'primary.main' : 'secondary.light'
    switch (goalLabel(url)) {
      case 'Start a Conversation':
        return <MessageChat1Icon sx={{ color }} />
      case 'Link to Bible':
        return <BibleIcon sx={{ color }} />
      case 'Visit a Website':
        return <LinkAngledIcon sx={{ color }} />
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
        data-testid="ActionsListViewDesktop"
      >
        <Table>
          <TableHead sx={{ borderBottom: '1.5px solid #DEDFE0' }}>
            <TableRow sx={{ backgroundColor: 'background.paper' }}>
              <TableCell width={60} />
              <TableCell>
                <Typography variant="subtitle2">
                  {t('Target and Action')}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" align="center" width={100}>
                  {t('Appears on')}
                </Typography>
              </TableCell>
              <TableCell width={50} />
            </TableRow>
          </TableHead>
          <TableBody>
            {actions?.map(({ url, count }, index) => (
              <StyledTableRow
                key={index}
                onClick={() => handleClick(url)}
                selectedAction={selectedAction}
                url={url}
              >
                <TableCell width={0} align="center" sx={{ pr: 2, pl: 5 }}>
                  <GoalIcon url={url} />
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
                      selectedAction === url ? 'secondary.dark' : 'text.primary'
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
                  <Typography variant="subtitle2">{count}</Typography>
                  <Typography variant="body2">
                    {count > 1 ? 'cards' : 'card'}
                  </Typography>
                </TableCell>
                <TableCell width={40} sx={{ pl: 0, pr: 5 }}>
                  <Edit2Icon
                    sx={{
                      color:
                        selectedAction === url
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
        data-testid="ActionsListViewMobile"
      >
        <Table>
          <TableHead sx={{ borderBottom: '1.5px solid #DEDFE0' }}>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2">
                  {t('Target and Action')}
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actions?.map(({ url, count }, index) => (
              <StyledTableRow
                key={index}
                onClick={() => handleClick(url)}
                selectedAction={selectedAction}
                url={url}
              >
                <TableCell>
                  <Stack gap={2}>
                    <Typography
                      variant="subtitle2"
                      color={
                        selectedAction === url
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
                      <GoalIcon url={url} />
                      <Typography variant="subtitle2" color="secondary.light">
                        {goalLabel(url)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="secondary.light">
                      {t('Appears on')}
                      <span style={{ fontWeight: 'bold' }}>{count}</span>{' '}
                      {count > 1 ? t('cards') : t('card')}
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
  selectedAction?: string
  url: string
}

const StyledTableRow = styled(TableRow)<StyledTableRowProps>(
  ({ theme, selectedAction, url }) => ({
    cursor: 'pointer',
    ...(selectedAction === url
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
