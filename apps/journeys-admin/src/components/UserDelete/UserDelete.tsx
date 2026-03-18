import { ApolloError, gql, useMutation, useSubscription, useSuspenseQuery } from '@apollo/client'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import {
  Component,
  ErrorInfo,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'

import { GetMe } from '../../../__generated__/GetMe'
import { UserDeleteIdType } from '../../../__generated__/globalTypes'
import {
  UserDeleteCheck,
  UserDeleteCheckVariables
} from '../../../__generated__/UserDeleteCheck'
import {
  UserDeleteConfirmSubscription,
  UserDeleteConfirmSubscriptionVariables
} from '../../../__generated__/UserDeleteConfirmSubscription'
import { GET_ME } from '../PageWrapper/NavigationDrawer/UserNavigation/UserNavigation'

interface LogEntry {
  message: string
  level: string
  timestamp: string
}

export const USER_DELETE_CHECK = gql`
  mutation UserDeleteCheck($idType: UserDeleteIdType!, $id: String!) {
    userDeleteCheck(idType: $idType, id: $id) {
      userId
      userEmail
      userFirstName
      journeysToDelete
      journeysToTransfer
      journeysToRemove
      teamsToDelete
      teamsToTransfer
      teamsToRemove
      logs {
        message
        level
        timestamp
      }
    }
  }
`

export const USER_DELETE_CONFIRM = gql`
  subscription UserDeleteConfirmSubscription($idType: UserDeleteIdType!, $id: String!) {
    userDeleteConfirm(idType: $idType, id: $id) {
      log {
        message
        level
        timestamp
      }
      done
      success
    }
  }
`

interface UserDeleteErrorBoundaryProps {
  children: ReactNode
}

interface UserDeleteErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class UserDeleteErrorBoundary extends Component<
  UserDeleteErrorBoundaryProps,
  UserDeleteErrorBoundaryState
> {
  constructor(props: UserDeleteErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): UserDeleteErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('UserDelete error:', error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <UserDeleteErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}

function UserDeleteErrorFallback({
  error
}: {
  error: Error | null
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Box sx={{ p: 4, maxWidth: 800 }}>
      <Alert severity="error">
        <AlertTitle>{t('Something went wrong')}</AlertTitle>
        <Typography variant="body2">
          {error?.message ?? t('An unexpected error occurred.')}
        </Typography>
      </Alert>
    </Box>
  )
}

export function UserDeleteWithErrorBoundary(): ReactElement {
  return (
    <UserDeleteErrorBoundary>
      <UserDeleteContent />
    </UserDeleteErrorBoundary>
  )
}

interface ConfirmVars {
  idType: UserDeleteIdType
  id: string
}

function UserDeleteContent(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const { data } = useSuspenseQuery<GetMe>(GET_ME, {
    variables: { input: { redirect: router?.query?.redirect } }
  })

  const [idType, setIdType] = useState<UserDeleteIdType>(UserDeleteIdType.email)
  const [userId, setUserId] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [checkComplete, setCheckComplete] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteComplete, setDeleteComplete] = useState(false)
  const [confirmVars, setConfirmVars] = useState<ConfirmVars | null>(null)

  const [userDeleteCheck, { loading: checkLoading }] = useMutation<
    UserDeleteCheck,
    UserDeleteCheckVariables
  >(USER_DELETE_CHECK)

  useSubscription<
    UserDeleteConfirmSubscription,
    UserDeleteConfirmSubscriptionVariables
  >(USER_DELETE_CONFIRM, {
    skip: confirmVars == null,
    variables: confirmVars ?? { idType: UserDeleteIdType.email, id: '' },
    onData: ({ data: subData }) => {
      const progress = subData.data?.userDeleteConfirm
      if (progress == null) return

      setLogs((prev) => [...prev, progress.log])

      if (progress.done) {
        setDeleteComplete(true)
        setConfirmVars(null)

        if (progress.success === true) {
          enqueueSnackbar(t('User deleted successfully'), {
            variant: 'success'
          })
          setCheckComplete(false)
        } else {
          enqueueSnackbar(t('User deletion failed. Check logs for details.'), {
            variant: 'error'
          })
        }
      }
    },
    onError: (error) => {
      const message = error.graphQLErrors[0]?.message ?? error.message
      setLogs((prev) => [
        ...prev,
        {
          message: `Error: ${message}`,
          level: 'error',
          timestamp: new Date().toISOString()
        }
      ])
      enqueueSnackbar(message, { variant: 'error', preventDuplicate: true })
      setConfirmVars(null)
    }
  })

  const confirmLoading = confirmVars != null && !deleteComplete

  const isSuperAdmin =
    data.me?.__typename === 'AuthenticatedUser' && data.me.superAdmin === true

  useEffect(() => {
    if (!isSuperAdmin) {
      void router.push('/')
    }
  }, [isSuperAdmin, router])

  const logText = useMemo(
    () =>
      logs
        .map((log) => {
          const time = new Date(log.timestamp).toLocaleTimeString()
          const prefix =
            log.level === 'error'
              ? 'ERROR'
              : log.level === 'warn'
                ? 'WARN'
                : 'INFO'
          return `[${time}] ${prefix}: ${log.message}`
        })
        .join('\n'),
    [logs]
  )

  const handleCheck = useCallback(async () => {
    if (userId.trim() === '') return

    setLogs([])
    setCheckComplete(false)
    setDeleteComplete(false)

    try {
      const { data: checkData } = await userDeleteCheck({
        variables: { idType, id: userId.trim() }
      })

      if (checkData?.userDeleteCheck != null) {
        setLogs(checkData.userDeleteCheck.logs)
        setCheckComplete(true)
      }
    } catch (error) {
      if (error instanceof ApolloError) {
        const message = error.graphQLErrors[0]?.message ?? error.message
        setLogs((prev) => [
          ...prev,
          {
            message: `Error: ${message}`,
            level: 'error',
            timestamp: new Date().toISOString()
          }
        ])
        enqueueSnackbar(message, { variant: 'error', preventDuplicate: true })
      }
    }
  }, [idType, userId, userDeleteCheck, enqueueSnackbar])

  const handleConfirmDelete = useCallback(() => {
    setConfirmOpen(false)
    setDeleteComplete(false)
    setConfirmVars({ idType, id: userId.trim() })
  }, [idType, userId])

  if (!isSuperAdmin) return <></>

  return (
    <Box sx={{ p: 4, maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom>
        {t('Delete User')}
      </Typography>

      <Alert id="delete-warning" severity="warning" sx={{ mb: 3 }}>
        <AlertTitle>{t('Warning')}</AlertTitle>
        <Typography variant="body2">
          {t(
            'This action permanently deletes a user and their associated data. This cannot be undone. Always run a check first to review what will be deleted.'
          )}
        </Typography>
      </Alert>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="flex-end">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="id-type-label">{t('Lookup By')}</InputLabel>
          <Select
            labelId="id-type-label"
            aria-describedby="delete-warning"
            value={idType}
            label={t('Lookup By')}
            onChange={(e) => {
              setIdType(e.target.value as UserDeleteIdType)
              setCheckComplete(false)
              setLogs([])
            }}
            disabled={checkLoading || confirmLoading}
          >
            <MenuItem value={UserDeleteIdType.email}>{t('Email')}</MenuItem>
            <MenuItem value={UserDeleteIdType.databaseId}>
              {t('Database ID')}
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          aria-label={
            idType === UserDeleteIdType.email
              ? t('User email to delete')
              : t('Database ID to delete')
          }
          aria-describedby="delete-warning"
          label={
            idType === UserDeleteIdType.email
              ? t('User Email')
              : t('Database ID')
          }
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value)
            setCheckComplete(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleCheck()
          }}
          disabled={checkLoading || confirmLoading}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={handleCheck}
          disabled={userId.trim() === '' || checkLoading || confirmLoading}
          sx={{ whiteSpace: 'nowrap', minWidth: 100 }}
        >
          {checkLoading ? t('Checking...') : t('Check')}
        </Button>
      </Stack>

      <TextField
        label={t('Logs')}
        multiline
        rows={16}
        fullWidth
        value={logText}
        slotProps={{
          input: {
            readOnly: true
          }
        }}
        sx={{
          mb: 3,
          '& .MuiInputBase-input': {
            fontFamily: 'monospace',
            fontSize: '0.85rem'
          }
        }}
      />

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="error"
          onClick={() => setConfirmOpen(true)}
          disabled={!checkComplete || confirmLoading || deleteComplete}
        >
          {confirmLoading ? t('Deleting...') : t('Delete User')}
        </Button>
      </Stack>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-delete-title"
      >
        <DialogTitle id="confirm-delete-title">
          {t('Confirm User Deletion')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'Are you sure you want to permanently delete this user? This action cannot be undone. All associated data including journeys, team memberships, and related records will be permanently removed.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t('Cancel')}</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            {t('Delete Permanently')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
