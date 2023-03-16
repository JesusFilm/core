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
import { useTheme } from '@mui/material/styles'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActionDetails } from '../../ActionDetails'
import type { Actions } from '../ActionsTable'

interface ActionsListProps {
  actions: Actions[]
}

export function ActionsList({ actions }: ActionsListProps): ReactElement {
  const { dispatch } = useEditor()
  const theme = useTheme()

  const goalLabel = (url: string): string => {
    const urlObject = new URL(url)
    const hostname = urlObject.hostname.replace('www.', '') // Remove 'www.' and top-level domain suffixes
    switch (hostname) {
      case 'm.me':
      case 'messenger.com':
      case 't.me':
      case 'telegram.org':
      case 'wa.me':
      case 'whatsapp.com':
      case 'vb.me':
      case 'viber.com':
      case 'snapchat.com':
      case 'skype.com':
      case 'line.me':
      case 'vk.com':
        return 'Start a conversation'
      case 'bible.com':
      case 'wordproject.org':
      case 'biblegateway.com':
      case 'worldbibles.org':
      case 'biblestudytools.com':
      case 'biblehub.com':
      case 'biblia.com':
      case 'blueletterbible.org':
      case 'bible-ru.org':
      case 'bibleonline.ru':
      case 'bible.by':
      case 'bible-facts.org':
      case 'copticchurch.net':
      case 'ebible.org':
      case 'arabicbible.com':
        return 'Link to bible'
      default:
        return 'Visit a website'
    }
  }

  useEffect(() => {
    dispatch({
      type: 'SetDrawerPropsAction',
      mobileOpen: true,
      title: 'Goal Details',
      children: <ActionDetails url={actions[0]?.url} />
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead
          sx={{
            [theme.breakpoints.down('md')]: { display: 'none', width: '100%' }
          }}
        >
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Target and Action</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2">Appears on</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {actions?.map(({ url, count }, i) => (
            <TableRow key={i}>
              <TableCell>
                <Typography variant="subtitle2">{goalLabel(url)}</Typography>
                <Typography variant="body2">{url}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="subtitle2">{count}</Typography>
                <Typography variant="body2">Cards</Typography>
              </TableCell>
              <TableCell>
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
