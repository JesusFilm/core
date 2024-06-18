import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'
import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { UpdateVideoBlockNextStep } from '../../../../../../../../../../__generated__/UpdateVideoBlockNextStep'
import { VideoBlockUpdate } from '../../../../../../../../../../__generated__/VideoBlockUpdate'
import { VideoBlockUpdateInput } from '../../../../../../../../../../__generated__/globalTypes'
import { VideoBlockEditor } from '../../../../../Drawer/VideoBlockEditor'

export const VIDEO_BLOCK_UPDATE = gql`
  ${VIDEO_FIELDS}
  mutation VideoBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: VideoBlockUpdateInput!
  ) {
    videoBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      ...VideoFields
    }
  }
`

export const UPDATE_VIDEO_BLOCK_NEXT_STEP = gql`
  mutation UpdateVideoBlockNextStep(
    $id: ID!
    $journeyId: ID!
    $input: NavigateToBlockActionInput!
  ) {
    blockUpdateNavigateToBlockAction(
      id: $id
      journeyId: $journeyId
      input: $input
    ) {
      parentBlockId
      gtmEventName
      blockId
    }
  }
`

export function VideoOptions(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { selectedStep, selectedBlock }
  } = useEditor()
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const [videoBlockUpdate] = useMutation<VideoBlockUpdate>(VIDEO_BLOCK_UPDATE)
  const [updateVideoBlockNextStep] = useMutation<UpdateVideoBlockNextStep>(
    UPDATE_VIDEO_BLOCK_NEXT_STEP
  )

  const updateDefaultNextStep = async (): Promise<void> => {
    const nextStepId = selectedStep?.nextBlockId
    const currentBlock = selectedBlock as TreeBlock<VideoBlock> | undefined
    if (nextStepId != null && currentBlock != null && journey != null) {
      await updateVideoBlockNextStep({
        variables: {
          id: currentBlock.id,
          journeyId: journey.id,
          input: {
            blockId: nextStepId
          }
        },
        update(cache, { data }) {
          if (data?.blockUpdateNavigateToBlockAction != null) {
            cache.modify({
              id: cache.identify({
                __typename: 'VideoBlock',
                id: currentBlock.id
              }),
              fields: {
                action: () => data?.blockUpdateNavigateToBlockAction
              }
            })
          }
        }
      })
    }
  }

  const handleChange = async (input: VideoBlockUpdateInput): Promise<void> => {
    if (selectedBlock == null || journey == null) return

    try {
      await videoBlockUpdate({
        variables: {
          id: selectedBlock.id,
          journeyId: journey.id,
          input
        }
      })
      await updateDefaultNextStep()
      enqueueSnackbar(t('Video Updated'), {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (e) {
      if (e instanceof Error) {
        enqueueSnackbar(e.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }

  return selectedBlock != null && selectedBlock.__typename === 'VideoBlock' ? (
    <VideoBlockEditor selectedBlock={selectedBlock} onChange={handleChange} />
  ) : (
    <></>
  )
}
