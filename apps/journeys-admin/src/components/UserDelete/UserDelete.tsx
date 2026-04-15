import {
  ApolloError,
  gql,
  useMutation,
  useSubscription,
  useSuspenseQuery
} from '@apollo/client'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
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
  Suspense,
  useCallback,
  useEffect,
  useRef,
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
import {
  UserDeleteJourneysCheck,
  UserDeleteJourneysCheckVariables
} from '../../../__generated__/UserDeleteJourneysCheck'
import {
  UserDeleteJourneysConfirm,
  UserDeleteJourneysConfirmVariables
} from '../../../__generated__/UserDeleteJourneysConfirm'
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
      logs {
        message
        level
        timestamp
      }
    }
  }
`

export const USER_DELETE_JOURNEYS_CHECK = gql`
  mutation UserDeleteJourneysCheck($userId: String!) {
    userDeleteJourneysCheck(userId: $userId) {
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

export const USER_DELETE_JOURNEYS_CONFIRM = gql`
  mutation UserDeleteJourneysConfirm($userId: String!) {
    userDeleteJourneysConfirm(userId: $userId) {
      success
      deletedJourneyIds
      deletedTeamIds
      deletedUserJourneyIds
      deletedUserTeamIds
      logs {
        message
        level
        timestamp
      }
    }
  }
`

export const USER_DELETE_CONFIRM = gql`
  subscription UserDeleteConfirmSubscription(
    $idType: UserDeleteIdType!
    $id: String!
    $deletedJourneyIds: [String!]!
    $deletedTeamIds: [String!]!
    $deletedUserJourneyIds: [String!]!
    $deletedUserTeamIds: [String!]!
  ) {
    userDeleteConfirm(
      idType: $idType
      id: $id
      deletedJourneyIds: $deletedJourneyIds
      deletedTeamIds: $deletedTeamIds
      deletedUserJourneyIds: $deletedUserJourneyIds
      deletedUserTeamIds: $deletedUserTeamIds
    ) {
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
      <Suspense fallback={<CircularProgress />}>
        <UserDeleteContent />
      </Suspense>
    </UserDeleteErrorBoundary>
  )
}

interface ConfirmVars {
  idType: UserDeleteIdType
  id: string
  deletedJourneyIds: string[]
  deletedTeamIds: string[]
  deletedUserJourneyIds: string[]
  deletedUserTeamIds: string[]
}

const levelLabel: Record<string, string> = {
  error: 'ERROR',
  warn: 'WARN',
  info: 'INFO'
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
  const [resolvedUserId, setResolvedUserId] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [checkComplete, setCheckComplete] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmVars, setConfirmVars] = useState<ConfirmVars | null>(null)

  const [userDeleteCheck, { loading: checkLoading }] = useMutation<
    UserDeleteCheck,
    UserDeleteCheckVariables
  >(USER_DELETE_CHECK)

  const [userDeleteJourneysCheck, { loading: journeysCheckLoading }] =
    useMutation<UserDeleteJourneysCheck, UserDeleteJourneysCheckVariables>(
      USER_DELETE_JOURNEYS_CHECK
    )

  const [userDeleteJourneysConfirm, { loading: journeysConfirmLoading }] =
    useMutation<UserDeleteJourneysConfirm, UserDeleteJourneysConfirmVariables>(
      USER_DELETE_JOURNEYS_CONFIRM
    )

  useSubscription<
    UserDeleteConfirmSubscription,
    UserDeleteConfirmSubscriptionVariables
  >(USER_DELETE_CONFIRM, {
    skip: confirmVars == null,
    variables: confirmVars ?? {
      idType: UserDeleteIdType.email,
      id: '',
      deletedJourneyIds: [],
      deletedTeamIds: [],
      deletedUserJourneyIds: [],
      deletedUserTeamIds: []
    },
    onData: ({ data: subData }) => {
      const progress = subData.data?.userDeleteConfirm
      if (progress == null) return

      setLogs((prev) => [...prev, progress.log])

      if (progress.done) {
        setConfirmVars(null)

        if (progress.success === true) {
          enqueueSnackbar(t('User deleted successfully'), {
            variant: 'success'
          })
        } else {
          enqueueSnackbar(t('User deletion failed. Check logs for details.'), {
            variant: 'error'
          })
        }
        setCheckComplete(false)
        setResolvedUserId('')
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

  // journeysConfirmLoading covers the period between clicking "Delete
  // Permanently" and the subscription starting.
  const confirmLoading = journeysConfirmLoading || confirmVars != null
  const isCheckLoading = checkLoading || journeysCheckLoading

  const isSuperAdmin =
    data.me?.__typename === 'AuthenticatedUser' && data.me.superAdmin === true

  useEffect(() => {
    if (!isSuperAdmin) {
      void router.push('/')
    }
  }, [isSuperAdmin, router])

  const logBoxRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = logBoxRef.current
    if (el != null) {
      el.scrollTop = el.scrollHeight
    }
  }, [logs])

  const logText = logs
    .map((log) => {
      const time = new Date(log.timestamp).toLocaleTimeString()
      return `[${time}] ${levelLabel[log.level] ?? log.level.toUpperCase()}: ${log.message}`
    })
    .join('\n')

  const handleCheck = useCallback(async () => {
    if (userId.trim() === '') return

    setLogs([])
    setCheckComplete(false)
    setResolvedUserId('')

    try {
      // Step 1: check user info from api-users
      const { data: checkData } = await userDeleteCheck({
        variables: { idType, id: userId.trim() }
      })

      if (checkData?.userDeleteCheck == null) return

      const userLogs: LogEntry[] = checkData.userDeleteCheck.logs
      const uid = checkData.userDeleteCheck.userId

      // Show Step 1 logs immediately so they're visible even if Step 2 fails
      setLogs(userLogs)
      setResolvedUserId(uid)

      // Step 2: check journeys counts from api-journeys-modern using the
      // resolved Firebase UID returned by userDeleteCheck
      if (uid !== '') {
        const { data: journeysData } = await userDeleteJourneysCheck({
          variables: { userId: uid }
        })
        if (journeysData?.userDeleteJourneysCheck != null) {
          setLogs((prev) => [
            ...prev,
            ...journeysData.userDeleteJourneysCheck.logs
          ])
        }
      }

      setCheckComplete(true)
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
      } else {
        const message =
          error instanceof Error
            ? error.message
            : t('An unexpected error occurred.')
        setLogs((prev) => [
          ...prev,
          {
            message: `Error: ${message}`,
            level: 'error',
            timestamp: new Date().toISOString()
          }
        ])
        enqueueSnackbar(t('An unexpected error occurred.'), {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }, [
    idType,
    userId,
    userDeleteCheck,
    userDeleteJourneysCheck,
    enqueueSnackbar,
    t
  ])

  const handleConfirmDelete = useCallback(async () => {
    setConfirmOpen(false)

    if (resolvedUserId === '') {
      const errMsg = t('An unexpected error occurred.')
      setLogs((prev) => [
        ...prev,
        {
          message: `Error: ${errMsg}`,
          level: 'error',
          timestamp: new Date().toISOString()
        }
      ])
      enqueueSnackbar(errMsg, { variant: 'error', preventDuplicate: true })
      return
    }

    try {
      // Step 3: delete journeys data from api-journeys-modern, get back IDs
      const journeysResult = await userDeleteJourneysConfirm({
        variables: { userId: resolvedUserId }
      })

      const journeysConfirmData = journeysResult.data?.userDeleteJourneysConfirm
      if (journeysConfirmData == null) {
        enqueueSnackbar(t('Journeys cleanup failed. Check logs for details.'), {
          variant: 'error'
        })
        return
      }

      // Append journeys confirm logs
      setLogs((prev) => [...prev, ...journeysConfirmData.logs])

      if (!journeysConfirmData.success) {
        enqueueSnackbar(t('Journeys cleanup failed. Check logs for details.'), {
          variant: 'error'
        })
        return
      }

      // Step 4: start userDeleteConfirm subscription with deleted IDs
      setConfirmVars({
        idType,
        id: userId.trim(),
        deletedJourneyIds: journeysConfirmData.deletedJourneyIds,
        deletedTeamIds: journeysConfirmData.deletedTeamIds,
        deletedUserJourneyIds: journeysConfirmData.deletedUserJourneyIds,
        deletedUserTeamIds: journeysConfirmData.deletedUserTeamIds
      })
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
      } else {
        const message =
          error instanceof Error
            ? error.message
            : t('An unexpected error occurred.')
        setLogs((prev) => [
          ...prev,
          {
            message: `Error: ${message}`,
            level: 'error',
            timestamp: new Date().toISOString()
          }
        ])
        enqueueSnackbar(t('An unexpected error occurred.'), {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }, [
    idType,
    userId,
    resolvedUserId,
    userDeleteJourneysConfirm,
    enqueueSnackbar,
    t
  ])

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
            SelectDisplayProps={{ 'aria-describedby': 'delete-warning' }}
            value={idType}
            label={t('Lookup By')}
            onChange={(e) => {
              setIdType(e.target.value as UserDeleteIdType)
              setCheckComplete(false)
              setResolvedUserId('')
              setLogs([])
            }}
            disabled={isCheckLoading || confirmLoading}
          >
            <MenuItem value={UserDeleteIdType.email}>{t('Email')}</MenuItem>
            <MenuItem value={UserDeleteIdType.databaseId}>
              {t('Database ID')}
            </MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          inputProps={{
            'aria-label':
              idType === UserDeleteIdType.email
                ? t('User email to delete')
                : t('Database ID to delete'),
            'aria-describedby': 'delete-warning'
          }}
          label={
            idType === UserDeleteIdType.email
              ? t('User Email')
              : t('Database ID')
          }
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value)
            setCheckComplete(false)
            setResolvedUserId('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void handleCheck()
          }}
          disabled={isCheckLoading || confirmLoading}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={() => {
            void handleCheck()
          }}
          disabled={userId.trim() === '' || isCheckLoading || confirmLoading}
          sx={{ whiteSpace: 'nowrap', minWidth: 100 }}
        >
          {isCheckLoading ? t('Checking...') : t('Check')}
        </Button>
      </Stack>

      <TextField
        label={t('Logs')}
        multiline
        rows={16}
        fullWidth
        value={logText}
        inputRef={logBoxRef}
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
          disabled={!checkComplete || confirmLoading}
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
            onClick={() => {
              void handleConfirmDelete()
            }}
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
