import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
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

import { CreateMuxVideoUploadByFileMutation } from '../../../__generated__/CreateMuxVideoUploadByFileMutation'
import { GetMyMuxVideoQuery } from '../../../__generated__/GetMyMuxVideoQuery'

import { TreeBlock } from '@core/journeys/ui/block'

import { addUploadToQueue as addUploadTaskUtil } from './utils/addUploadToQueue'
import { cancelUploadForBlock as cancelUploadForBlockUtil } from './utils/cancelUploadForBlock'
import { MAX_POLL_TIME, POLL_INTERVAL } from './utils/constants'
import { handlePollingComplete } from './utils/handlePollingComplete'
import { handlePollingError } from './utils/handlePollingError'
import { processUpload } from './utils/processUpload'
import { createShowSnackbar } from './utils/showSnackbar'
import { startPolling as startPollingUtil } from './utils/startPolling'
import type { PollingTask, UploadTask } from './utils/types'

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

export const CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION = gql`
  mutation CreateMuxVideoUploadByFileMutation(
    $name: String!
    $generateSubtitlesInput: GenerateSubtitlesInput
  ) {
    createMuxVideoUploadByFile(
      name: $name
      generateSubtitlesInput: $generateSubtitlesInput
    ) {
      uploadUrl
      id
    }
  }
`

interface MuxVideoUploadContextType {
  getUploadStatus: (videoBlockId: string) => UploadTask | null
  addUploadTask: (
    videoBlockId: string,
    file: File,
    languageCode?: string,
    languageName?: string,
    onComplete?: (videoId: string) => void
  ) => void
  cancelUploadForBlock: (block: TreeBlock) => void
}

const MuxVideoUploadContext = createContext<
  MuxVideoUploadContextType | undefined
>(undefined)

export function MuxVideoUploadProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const [pollingTasks, setPollingTasks] = useState<Map<string, PollingTask>>(
    new Map()
  )
  const [uploadTasks, setUploadTasks] = useState<Map<string, UploadTask>>(
    new Map()
  )
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [getMyMuxVideo] = useLazyQuery<GetMyMuxVideoQuery>(
    GET_MY_MUX_VIDEO_QUERY,
    {
      fetchPolicy: 'network-only'
    }
  )
  const hasShownStartNotification = useRef<Set<string>>(new Set())
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const uploadInstanceRefs = useRef<Map<string, { abort: () => void }>>(
    new Map()
  )

  const [createMuxVideoUploadByFile] =
    useMutation<CreateMuxVideoUploadByFileMutation>(
      CREATE_MUX_VIDEO_UPLOAD_BY_FILE_MUTATION
    )

  const showSnackbar = useCallback(
    createShowSnackbar(enqueueSnackbar, closeSnackbar),
    [enqueueSnackbar, closeSnackbar]
  )

  const handlePollingCompleteCallback = useCallback(
    async (videoId: string) => {
      await handlePollingComplete(videoId, {
        pollingTasks,
        setPollingTasks,
        showSnackbar,
        t,
        pollingIntervalsRef
      })
    },
    [showSnackbar, t, pollingTasks, pollingIntervalsRef]
  )

  const handlePollingErrorCallback = useCallback(
    (videoId: string, error: string) => {
      handlePollingError(videoId, error, {
        setPollingTasks,
        showSnackbar,
        pollingIntervalsRef
      })
    },
    [showSnackbar, pollingIntervalsRef]
  )

  const startPolling = useCallback(
    (videoId: string, languageCode?: string, onComplete?: () => void) => {
      startPollingUtil(videoId, languageCode, onComplete, {
        hasShownStartNotification,
        showSnackbar,
        t,
        setPollingTasks
      })
    },
    [showSnackbar, t, hasShownStartNotification, setPollingTasks]
  )

  // process all waiting upload tasks
  useEffect(() => {
    const waitingTasks = Array.from(uploadTasks.entries()).filter(
      ([, task]) => task.status === 'waiting'
    )

    if (waitingTasks.length === 0) return

    for (const [videoBlockId, task] of waitingTasks) {
      void processUpload(videoBlockId, task, {
        setUploadTasks,
        createMuxVideoUploadByFile,
        startPolling: (videoId, languageCode, onComplete) => {
          startPolling(videoId, languageCode, onComplete)
        },
        uploadInstanceRefs
      })
    }
  }, [uploadTasks, startPolling, createMuxVideoUploadByFile])

  const getUploadStatus = useCallback(
    (videoBlockId: string) => {
      return uploadTasks.get(videoBlockId) ?? null
    },
    [uploadTasks]
  )

  const addUploadTask = useCallback(
    (
      videoBlockId: string,
      file: File,
      languageCode?: string,
      languageName?: string,
      onComplete?: (videoId: string) => void
    ) => {
      addUploadTaskUtil(
        videoBlockId,
        file,
        languageCode,
        languageName,
        onComplete,
        {
          setUploadTasks
        }
      )
    },
    [setUploadTasks]
  )

  const cancelUploadForBlock = useCallback(
    (block: TreeBlock) => {
      cancelUploadForBlockUtil(block, {
        uploadTasks,
        setUploadTasks,
        setPollingTasks,
        uploadInstanceRefs,
        pollingIntervalsRef,
        hasShownStartNotification
      })
    },
    [uploadTasks]
  )

  // handle polling for all processing tasks
  useEffect(() => {
    const processingTasks = Array.from(pollingTasks.entries()).filter(
      ([, task]) => task.status === 'processing'
    )

    for (const [videoId, task] of processingTasks) {
      if (pollingIntervalsRef.current.has(videoId)) continue

      const poll = async () => {
        try {
          const { data } = await getMyMuxVideo({
            variables: { id: videoId }
          })

          const video = data?.getMyMuxVideo

          const isVideoReady =
            video?.readyToStream === true &&
            video?.assetId != null &&
            video?.playbackId != null

          if (isVideoReady) {
            await handlePollingCompleteCallback(videoId)
            return
          }

          if (Date.now() - task.startTime > MAX_POLL_TIME) {
            handlePollingErrorCallback(videoId, t('Video processing timed out'))
          }
        } catch (error) {
          handlePollingErrorCallback(
            videoId,
            t('Something went wrong, try again')
          )
        }
      }

      void poll()

      const interval = setInterval(() => {
        void poll()
      }, POLL_INTERVAL)

      pollingIntervalsRef.current.set(videoId, interval)
    }

    return () => {
      for (const interval of pollingIntervalsRef.current.values()) {
        clearInterval(interval)
      }
      pollingIntervalsRef.current.clear()
    }
  }, [
    pollingTasks,
    handlePollingCompleteCallback,
    handlePollingErrorCallback,
    getMyMuxVideo,
    t
  ])

  return (
    <MuxVideoUploadContext.Provider
      value={{
        getUploadStatus,
        addUploadTask,
        cancelUploadForBlock
      }}
    >
      {children}
    </MuxVideoUploadContext.Provider>
  )
}

export function useMuxVideoUpload(): MuxVideoUploadContextType {
  const context = useContext(MuxVideoUploadContext)
  if (context === undefined) {
    throw new Error(
      'useMuxVideoUpload must be used within a MuxVideoUploadProvider'
    )
  }
  return context
}
