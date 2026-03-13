import { useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { Dispatch, RefObject, SetStateAction, useCallback } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import {
  IdType,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'
import { VIDEO_BLOCK_UPDATE } from '../../../Editor/Slider/Settings/CanvasDetails/Properties/blocks/Video/Options/VideoOptions'

import type { UploadTaskInternal } from './types'

interface UseYouTubeVideoLinkingParams {
  setUploadTasks: Dispatch<SetStateAction<Map<string, UploadTaskInternal>>>
  updateTask: (
    videoBlockId: string,
    updates: Partial<UploadTaskInternal>
  ) => void
  removeTask: (videoBlockId: string) => void
  activeBlocksRef: RefObject<Set<string>>
}

/**
 * Manages persisting a YouTube video URL to a video block via VIDEO_BLOCK_UPDATE.
 *
 * Unlike Mux uploads there is no file transfer or polling — just a single
 * mutation call. The block is marked as 'updating' for the duration so that
 * `hasActiveUploads` stays true, preventing navigation away from the media screen.
 */
export function useYouTubeVideoLinking({
  setUploadTasks,
  updateTask,
  removeTask,
  activeBlocksRef
}: UseYouTubeVideoLinkingParams): {
  linkYouTubeVideo: (
    videoBlockId: string,
    youtubeVideoId: string
  ) => Promise<boolean>
} {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()

  const [videoBlockUpdate] = useMutation(VIDEO_BLOCK_UPDATE)

  const linkYouTubeVideo = useCallback(
    async (videoBlockId: string, youtubeVideoId: string): Promise<boolean> => {
      if (activeBlocksRef.current.has(videoBlockId)) return false
      if (journey?.id == null) return false

      activeBlocksRef.current.add(videoBlockId)
      setUploadTasks((prev) => {
        const next = new Map(prev)
        next.set(videoBlockId, {
          videoBlockId,
          status: 'updating',
          progress: 0,
          retryCount: 0
        })
        return next
      })

      try {
        await videoBlockUpdate({
          variables: {
            id: videoBlockId,
            input: {
              videoId: youtubeVideoId,
              source: VideoBlockSource.youTube
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
        enqueueSnackbar(t('YouTube video set successfully'), {
          variant: 'success',
          autoHideDuration: 2000
        })
        removeTask(videoBlockId)
        return true
      } catch {
        const errorMessage = t('Failed to set YouTube video. Please try again')
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 2000
        })
        updateTask(videoBlockId, {
          status: 'error',
          error: errorMessage
        })
        return false
      } finally {
        activeBlocksRef.current.delete(videoBlockId)
      }
    },
    [
      activeBlocksRef,
      journey?.id,
      videoBlockUpdate,
      enqueueSnackbar,
      t,
      setUploadTasks,
      updateTask,
      removeTask
    ]
  )

  return { linkYouTubeVideo }
}
