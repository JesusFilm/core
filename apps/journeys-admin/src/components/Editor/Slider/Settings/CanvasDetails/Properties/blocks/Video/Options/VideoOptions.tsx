import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import { VideoBlockUpdateInput } from '../../../../../../../../../../__generated__/globalTypes'
import { VideoBlockUpdate } from '../../../../../../../../../../__generated__/VideoBlockUpdate'
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
    state: { selectedBlock }
  } = useEditor()
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const [videoBlockUpdate] = useMutation<VideoBlockUpdate>(VIDEO_BLOCK_UPDATE)

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
