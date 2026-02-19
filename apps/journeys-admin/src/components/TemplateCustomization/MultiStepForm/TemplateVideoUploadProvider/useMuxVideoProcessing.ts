import { useLazyQuery, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { useCallback, useRef } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import {
  IdType,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'
import { VIDEO_BLOCK_UPDATE } from '../../../Editor/Slider/Settings/CanvasDetails/Properties/blocks/Video/Options/VideoOptions'

import { GET_MY_MUX_VIDEO_QUERY } from './graphql'
import { INITIAL_POLL_INTERVAL, MAX_POLL_INTERVAL, MAX_RETRIES } from './types'
import type { UploadTaskInternal } from './types'

interface UseMuxVideoProcessingParams {
  updateTask: (
    videoBlockId: string,
    updates: Partial<UploadTaskInternal>
  ) => void
  removeTask: (videoBlockId: string) => void
  activeBlocksRef: React.MutableRefObject<Set<string>>
}

/**
 * Manages the post-upload lifecycle: polling Mux for readyToStream, then
 * persisting the video block via VIDEO_BLOCK_UPDATE.
 *
 * Polls getMyMuxVideo with exponential backoff (×1.5, capped at 30s).
 * On readyToStream, runs VIDEO_BLOCK_UPDATE then refetches the journey.
 * Retries transient errors up to MAX_RETRIES.
 */
export function useMuxVideoProcessing({
  updateTask,
  removeTask,
  activeBlocksRef
}: UseMuxVideoProcessingParams): {
  startPolling: (videoBlockId: string, videoId: string) => void
  clearPollingForBlock: (videoBlockId: string) => void
} {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()

  const pollingTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const retryCountRef = useRef<Map<string, number>>(new Map())

  const [getMyMuxVideo] = useLazyQuery(GET_MY_MUX_VIDEO_QUERY, {
    fetchPolicy: 'network-only'
  })
  const [videoBlockUpdate] = useMutation(VIDEO_BLOCK_UPDATE)

  /**
   * Cancels the pending polling timeout and resets the retry counter for a given block.
   */
  const clearPollingForBlock = useCallback((videoBlockId: string) => {
    const timeout = pollingTimeoutsRef.current.get(videoBlockId)
    if (timeout != null) {
      clearTimeout(timeout)
      pollingTimeoutsRef.current.delete(videoBlockId)
    }
    retryCountRef.current.delete(videoBlockId)
  }, [])

  /**
   * Final step after Mux reports readyToStream. Persists the new video to the
   * block via VIDEO_BLOCK_UPDATE, refetches the journey, then removes the task.
   */
  const runVideoBlockUpdate = useCallback(
    async (videoBlockId: string, videoId: string) => {
      if (journey?.id == null) return

      updateTask(videoBlockId, { status: 'updating' })

      try {
        await videoBlockUpdate({
          variables: {
            id: videoBlockId,
            input: {
              videoId,
              source: VideoBlockSource.mux
            }
          },
          refetchQueries: [
            {
              query: GET_JOURNEY,
              variables: {
                id: journey.id,
                idType: IdType.databaseId,
                options: { skipRoutingFilter: true }
              }
            }
          ]
        })
        enqueueSnackbar(t('File uploaded successfully'), { variant: 'success' })
        clearPollingForBlock(videoBlockId)
        removeTask(videoBlockId)
      } catch {
        enqueueSnackbar(t('Upload failed. Please try again'), {
          variant: 'error'
        })
        updateTask(videoBlockId, {
          status: 'error',
          error: 'Upload failed. Please try again'
        })
      }
    },
    [
      journey?.id,
      videoBlockUpdate,
      enqueueSnackbar,
      t,
      updateTask,
      removeTask,
      clearPollingForBlock
    ]
  )

  /**
   * Polls getMyMuxVideo until readyToStream is true, then hands off to
   * runVideoBlockUpdate. Uses exponential backoff (×1.5, capped at 30s).
   * Retries up to MAX_RETRIES on transient errors before giving up.
   */
  const startPolling = useCallback(
    (videoBlockId: string, videoId: string) => {
      updateTask(videoBlockId, { status: 'processing', videoId })

      const poll = (delay: number) => {
        const timeout = setTimeout(async () => {
          try {
            const result = await getMyMuxVideo({
              variables: { id: videoId }
            })

            if (result.error != null) {
              throw result.error
            }

            if (result.data?.getMyMuxVideo?.readyToStream === true) {
              clearPollingForBlock(videoBlockId)
              await runVideoBlockUpdate(videoBlockId, videoId)
              return
            }

            retryCountRef.current.set(videoBlockId, 0)

            const nextDelay = Math.min(delay * 1.5, MAX_POLL_INTERVAL)
            pollingTimeoutsRef.current.set(
              videoBlockId,
              setTimeout(() => poll(nextDelay), delay)
            )
          } catch (err) {
            const currentRetries = retryCountRef.current.get(videoBlockId) ?? 0
            if (currentRetries < MAX_RETRIES) {
              retryCountRef.current.set(videoBlockId, currentRetries + 1)
              pollingTimeoutsRef.current.set(
                videoBlockId,
                setTimeout(() => poll(delay), delay)
              )
              return
            }

            clearPollingForBlock(videoBlockId)
            activeBlocksRef.current.delete(videoBlockId)
            enqueueSnackbar(t('Upload failed. Please try again'), {
              variant: 'error'
            })
            updateTask(videoBlockId, {
              status: 'error',
              error: 'Failed to check video status'
            })
          }
        }, delay)
        pollingTimeoutsRef.current.set(videoBlockId, timeout)
      }

      poll(INITIAL_POLL_INTERVAL)
    },
    [
      getMyMuxVideo,
      updateTask,
      clearPollingForBlock,
      runVideoBlockUpdate,
      enqueueSnackbar,
      t,
      activeBlocksRef
    ]
  )

  return {
    startPolling,
    clearPollingForBlock
  }
}
