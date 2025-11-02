import { useApolloClient, useLazyQuery } from '@apollo/client'
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
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

import {
  GET_MUX_SUBTITLE_TRACK,
  GET_MUX_VIDEO_WITH_SUBTITLES
} from '../Editor/Slider/Settings/Drawer/VideoBlockEditor/Settings/SubtitleSelector/muxSubtitleQueries'

interface PollingTask {
  subtitleTrackId: string
  languageCode: string
  userGenerated?: boolean
  status: 'polling' | 'completed' | 'error'
  startTime: number
  stopPolling: () => void
}

interface MuxSubtitlePollingContextType {
  startPolling: (
    muxVideoId: string,
    subtitleTrackId: string,
    languageCode: string,
    userGenerated?: boolean
  ) => void
  stopPolling: (muxVideoId: string) => void
  getPollingStatus: (muxVideoId: string) => PollingTask | null
}

const MuxSubtitlePollingContext = createContext<
  MuxSubtitlePollingContextType | undefined
>(undefined)

const STORAGE_KEY = 'mux-subtitle-polls'
const POLL_INTERVAL = 3000 // 3 seconds
const MAX_POLL_TIME = 60000 // 60 seconds

interface StoredPoll {
  subtitleTrackId: string
  languageCode: string
  userGenerated?: boolean
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
    polls.forEach((task, muxVideoId) => {
      if (task.status === 'polling') {
        toStore[muxVideoId] = {
          subtitleTrackId: task.subtitleTrackId,
          languageCode: task.languageCode,
          userGenerated: task.userGenerated,
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

export function MuxSubtitlePollingProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const [pollingTasks, setPollingTasks] = useState<Map<string, PollingTask>>(
    new Map()
  )
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const apolloClient = useApolloClient()
  const hasShownStartNotification = useRef<Set<string>>(new Set())
  const stopQueryRefs = useRef<Map<string, () => void>>(new Map())

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

    storedPolls.forEach((poll, muxVideoId) => {
      // Check if poll has expired
      if (now - poll.startTime > MAX_POLL_TIME) {
        console.warn(
          `Mux subtitle poll for video ${muxVideoId} expired (60s timeout)`
        )
        return
      }

      // Create a placeholder task that will be populated when polling starts
      restoredTasks.set(muxVideoId, {
        ...poll,
        status: 'polling',
        stopPolling: () => {}
      })
    })

    if (restoredTasks.size > 0) {
      setPollingTasks(restoredTasks)
    }
  }, [])

  const handlePollingComplete = useCallback(
    (muxVideoId: string, languageCode: string) => {
      setPollingTasks((prev) => {
        const task = prev.get(muxVideoId)
        if (task == null) return prev

        task.stopPolling()
        const next = new Map(prev)
        next.set(muxVideoId, { ...task, status: 'completed' })
        return next
      })

      enqueueSnackbar('Subtitle generation completed', {
        variant: 'success',
        persist: true,
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

      // Refetch the video query to update UI with ready subtitle
      void apolloClient.refetchQueries({
        include: [GET_MUX_VIDEO_WITH_SUBTITLES]
      })

      // Remove from state after notification
      setTimeout(() => {
        setPollingTasks((prev) => {
          const next = new Map(prev)
          next.delete(muxVideoId)
          if (next.size === 0) {
            clearStorage()
          }
          return next
        })
      }, 1000)
    },
    [enqueueSnackbar, closeSnackbar, apolloClient]
  )

  const handlePollingError = useCallback(
    (muxVideoId: string, error: string) => {
      setPollingTasks((prev) => {
        const task = prev.get(muxVideoId)
        if (task == null) return prev

        task.stopPolling()
        const next = new Map(prev)
        next.set(muxVideoId, { ...task, status: 'error' })
        return next
      })

      enqueueSnackbar(error || 'Subtitle generation interrupted', {
        variant: 'error',
        persist: true,
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

      // Refetch the video query to update UI with removed subtitle
      void apolloClient.refetchQueries({
        include: [GET_MUX_VIDEO_WITH_SUBTITLES]
      })

      // Remove from state after notification
      setTimeout(() => {
        setPollingTasks((prev) => {
          const next = new Map(prev)
          next.delete(muxVideoId)
          if (next.size === 0) {
            clearStorage()
          }
          return next
        })
      }, 1000)
    },
    [enqueueSnackbar, closeSnackbar, apolloClient]
  )

  const startPolling = useCallback(
    (
      muxVideoId: string,
      subtitleTrackId: string,
      languageCode: string,
      userGenerated?: boolean
    ) => {
      // Show start notification only once per video
      if (!hasShownStartNotification.current.has(muxVideoId)) {
        enqueueSnackbar('Subtitle generation in progress', {
          variant: 'success',
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
        hasShownStartNotification.current.add(muxVideoId)
      }

      const startTime = Date.now()

      // Create task entry immediately
      setPollingTasks((prev) => {
        const next = new Map(prev)
        next.set(muxVideoId, {
          subtitleTrackId,
          languageCode,
          userGenerated,
          status: 'polling',
          startTime,
          stopPolling: () => {
            // Reference the stopQuery function from the ref map
            stopQueryRefs.current.get(muxVideoId)?.()
          }
        })
        return next
      })
    },
    [enqueueSnackbar, closeSnackbar]
  )

  const stopPolling = useCallback((muxVideoId: string) => {
    setPollingTasks((prev) => {
      const task = prev.get(muxVideoId)
      if (task == null) return prev

      task.stopPolling()
      const next = new Map(prev)
      next.delete(muxVideoId)
      if (next.size === 0) {
        clearStorage()
      }
      return next
    })
    stopQueryRefs.current.delete(muxVideoId)
  }, [])

  const getPollingStatus = useCallback(
    (muxVideoId: string) => {
      return pollingTasks.get(muxVideoId) ?? null
    },
    [pollingTasks]
  )

  // Component to handle polling for each task
  function PollingTask({
    muxVideoId,
    task
  }: {
    muxVideoId: string
    task: PollingTask
  }): null {
    const hasStartedPolling = useRef(false)

    const [getSubtitleTrack, { stopPolling: stopQuery }] = useLazyQuery(
      GET_MUX_SUBTITLE_TRACK,
      {
        pollInterval: POLL_INTERVAL,
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
          const result = data?.getMyMuxSubtitleTrack

          if (result?.__typename === 'QueryGetMyMuxSubtitleTrackSuccess') {
            if (result.data.readyToStream) {
              handlePollingComplete(muxVideoId, task.languageCode)
            }
          } else if (result?.__typename === 'Error') {
            handlePollingError(muxVideoId, result.message)
          }

          // Check timeout
          if (Date.now() - task.startTime > MAX_POLL_TIME) {
            console.warn(
              `Mux subtitle poll for video ${muxVideoId} gave up after 60s`
            )
            stopQuery()
            handlePollingError(
              muxVideoId,
              'Subtitle generation timed out after 60 seconds'
            )
          }
        },
        onError: (error) => {
          handlePollingError(muxVideoId, error.message)
        }
      }
    )

    useEffect(() => {
      if (task.status !== 'polling') return
      if (hasStartedPolling.current) return

      hasStartedPolling.current = true

      // Store the stopQuery function in the ref map
      stopQueryRefs.current.set(muxVideoId, stopQuery)

      // Start polling
      void getSubtitleTrack({
        variables: {
          id: task.subtitleTrackId,
          userGenerated: task.userGenerated
        }
      })

      return () => {
        stopQuery()
        stopQueryRefs.current.delete(muxVideoId)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task.status])

    return null
  }

  return (
    <MuxSubtitlePollingContext.Provider
      value={{
        startPolling,
        stopPolling,
        getPollingStatus
      }}
    >
      {children}
      {Array.from(pollingTasks.entries()).map(([muxVideoId, task]) => (
        <PollingTask key={muxVideoId} muxVideoId={muxVideoId} task={task} />
      ))}
    </MuxSubtitlePollingContext.Provider>
  )
}

export function useMuxSubtitlePolling(): MuxSubtitlePollingContextType {
  const context = useContext(MuxSubtitlePollingContext)
  if (context === undefined) {
    throw new Error(
      'useMuxSubtitlePolling must be used within a MuxSubtitlePollingProvider'
    )
  }
  return context
}
