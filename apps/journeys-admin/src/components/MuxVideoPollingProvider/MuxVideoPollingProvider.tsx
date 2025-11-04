import { gql, useApolloClient, useLazyQuery } from '@apollo/client'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import { useSnackbar } from 'notistack'
import {
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import { GetMyMuxVideoQuery } from '../../../__generated__/GetMyMuxVideoQuery'
import { useTranslation } from 'react-i18next'

export const GET_MY_MUX_VIDEO_QUERY = gql`
  query GetMyMuxVideoQuery($id: ID!) {
    getMyMuxVideo(id: $id) {
      id
      assetId
      playbackId
      readyToStream
    }
  }
`

interface PollingTask {
  videoId: string
  languageCode?: string
  status: 'processing' | 'completed' | 'error'
  startTime: number
  stopPolling: () => void
  onComplete?: () => void
}

interface MuxVideoPollingContextType {
  startPolling: (
    videoId: string,
    languageCode?: string,
    onComplete?: () => void
  ) => void
  stopPolling: (videoId: string) => void
  getPollingStatus: (videoId: string) => PollingTask | null
}

const MuxVideoPollingContext = createContext<
  MuxVideoPollingContextType | undefined
>(undefined)

const STORAGE_KEY = 'mux-video-polls'
const POLL_INTERVAL = 3000 // 3 seconds
const MAX_POLL_TIME = 60000 // 60 seconds
const TASK_CLEANUP_DELAY = 1000 // Delay before removing completed/errored tasks from pollingTasks

interface StoredPoll {
  videoId: string
  languageCode?: string
  startTime: number
}

function loadPolls(): Map<string, StoredPoll> {
  if (typeof window === 'undefined') return new Map()

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored == null) return new Map()

    const parsed = JSON.parse(stored) as Record<string, StoredPoll>
    return new Map(Object.entries(parsed))
  } catch {
    return new Map()
  }
}

function savePolls(polls: Map<string, PollingTask>): void {
  if (typeof window === 'undefined') return

  try {
    const toStore: Record<string, StoredPoll> = {}
    polls.forEach((task, videoId) => {
      if (task.status === 'processing') {
        toStore[videoId] = {
          videoId: task.videoId,
          languageCode: task.languageCode,
          startTime: task.startTime
        }
      }
    })
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  } catch {
    // Ignore storage errors
  }
}

function clearStorage(): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}

export function MuxVideoPollingProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const [pollingTasks, setPollingTasks] = useState<Map<string, PollingTask>>(
    new Map()
  )
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const apolloClient = useApolloClient()
  const hasShownStartNotification = useRef<Set<string>>(new Set())
  const stopQueryRefs = useRef<Map<string, () => void>>(new Map())

  const showSnackbar = useCallback(
    (
      message: string,
      variant: 'success' | 'error' | 'info' | 'warning',
      persist?: boolean
    ) => {
      enqueueSnackbar(message, {
        variant,
        ...(persist === true && { persist: true }),
        action: (key) => (
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => {
              closeSnackbar(key)
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )
      })
    },
    [enqueueSnackbar, closeSnackbar]
  )

  // Save to sessionStorage whenever polling tasks change
  useEffect(() => {
    savePolls(pollingTasks)
  }, [pollingTasks])

  // Restore polls from sessionStorage on mount
  useEffect(() => {
    const storedPolls = loadPolls()
    if (storedPolls.size === 0) return

    const now = Date.now()
    const restoredTasks = new Map<string, PollingTask>()

    storedPolls.forEach((poll, videoId) => {
      // Check if poll has expired
      if (now - poll.startTime > MAX_POLL_TIME) {
        console.warn(
          `Mux video poll for video ${videoId} expired (60s timeout)`
        )
        return
      }

      // Create a placeholder task that will be populated when polling starts
      restoredTasks.set(videoId, {
        ...poll,
        status: 'processing',
        stopPolling: () => {}
      })
    })

    if (restoredTasks.size > 0) {
      setPollingTasks(restoredTasks)
    }
  }, [])

  const handlePollingComplete = useCallback(
    async (videoId: string) => {
      const task = pollingTasks.get(videoId)
      if (task == null) return

      task.stopPolling()

      setPollingTasks((prev) => {
        const next = new Map(prev)
        next.set(videoId, { ...task, status: 'completed' })
        return next
      })

      // Wait for refetch to complete to ensure data is in cache
      await apolloClient.refetchQueries({
        include: 'active'
      })

      showSnackbar(t('Video upload completed'), 'success', true)

      // Call the completion callback after data is ready
      if (task.onComplete != null) {
        task.onComplete()
      }

      // Remove from state after notification
      setTimeout(() => {
        setPollingTasks((prev) => {
          const next = new Map(prev)
          next.delete(videoId)
          if (next.size === 0) {
            clearStorage()
          }
          return next
        })
      }, TASK_CLEANUP_DELAY)
    },
    [showSnackbar, apolloClient, t, pollingTasks]
  )

  const handlePollingError = useCallback(
    (videoId: string, error: string) => {
      setPollingTasks((prev) => {
        const task = prev.get(videoId)
        if (task == null) return prev

        task.stopPolling()
        const next = new Map(prev)
        next.set(videoId, { ...task, status: 'error' })
        return next
      })

      showSnackbar(error, 'error', true)

      // Remove from state after notification
      setTimeout(() => {
        setPollingTasks((prev) => {
          const next = new Map(prev)
          next.delete(videoId)
          if (next.size === 0) {
            clearStorage()
          }
          return next
        })
      }, TASK_CLEANUP_DELAY)
    },
    [showSnackbar]
  )

  const startPolling = useCallback(
    (videoId: string, languageCode?: string, onComplete?: () => void) => {
      // Show start notification only once per video
      if (!hasShownStartNotification.current.has(videoId)) {
        showSnackbar(t('Video upload in progress'), 'success')
        hasShownStartNotification.current.add(videoId)
      }

      const startTime = Date.now()

      // Create task entry immediately with callback
      setPollingTasks((prev) => {
        const next = new Map(prev)
        next.set(videoId, {
          videoId,
          languageCode,
          status: 'processing',
          startTime,
          onComplete,
          stopPolling: () => {
            // Reference the stopQuery function from the ref map
            stopQueryRefs.current.get(videoId)?.()
          }
        })
        return next
      })
    },
    [showSnackbar, t]
  )

  const stopPolling = useCallback((videoId: string) => {
    setPollingTasks((prev) => {
      const task = prev.get(videoId)
      if (task == null) return prev

      task.stopPolling()
      const next = new Map(prev)
      next.delete(videoId)
      if (next.size === 0) {
        clearStorage()
      }
      return next
    })
    stopQueryRefs.current.delete(videoId)
    hasShownStartNotification.current.delete(videoId)
  }, [])

  const getPollingStatus = useCallback(
    (videoId: string) => {
      return pollingTasks.get(videoId) ?? null
    },
    [pollingTasks]
  )

  // Component to handle polling for each task
  function PollingTask({
    videoId,
    task
  }: {
    videoId: string
    task: PollingTask
  }): null {
    const hasStartedPolling = useRef(false)

    const [getMyMuxVideo, { stopPolling: stopQuery }] =
      useLazyQuery<GetMyMuxVideoQuery>(GET_MY_MUX_VIDEO_QUERY, {
        pollInterval: POLL_INTERVAL,
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
          const video = data?.getMyMuxVideo

          // Check if video is ready to stream
          if (
            video?.readyToStream === true &&
            video?.assetId != null &&
            video?.playbackId != null
          ) {
            handlePollingComplete(videoId)
          }

          // Check timeout
          if (Date.now() - task.startTime > MAX_POLL_TIME) {
            stopQuery()
            handlePollingError(videoId, t('Video processing timed out'))
          }
        },
        onError: (error) => {
          // Log securely (error)
          handlePollingError(videoId, t('Something went wrong, try again'))
        }
      })

    useEffect(() => {
      if (task.status !== 'processing') return
      if (hasStartedPolling.current) return

      hasStartedPolling.current = true

      // Store the stopQuery function in the ref map
      stopQueryRefs.current.set(videoId, stopQuery)

      // Start polling
      void getMyMuxVideo({
        variables: {
          id: videoId
        }
      })

      return () => {
        stopQuery()
        stopQueryRefs.current.delete(videoId)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task.status])

    return null
  }

  return (
    <MuxVideoPollingContext.Provider
      value={{
        startPolling,
        stopPolling,
        getPollingStatus
      }}
    >
      {children}
      {Array.from(pollingTasks.entries()).map(([videoId, task]) => (
        <PollingTask key={videoId} videoId={videoId} task={task} />
      ))}
    </MuxVideoPollingContext.Provider>
  )
}

export function useMuxVideoPolling(): MuxVideoPollingContextType {
  const context = useContext(MuxVideoPollingContext)
  if (context === undefined) {
    throw new Error(
      'useMuxVideoPolling must be used within a MuxVideoPollingProvider'
    )
  }
  return context
}
