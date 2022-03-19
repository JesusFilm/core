import { ReactElement } from 'react'
import { useEditor, VIDEO_FIELDS } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { VideoBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { VideoBlockEditor } from '../../../../../VideoBlockEditor'
import { VideoBlockUpdate } from '../../../../../../../../__generated__/VideoBlockUpdate'
import { useJourney } from '../../../../../../../libs/context'

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

export function VideoOptions(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()
  const journey = useJourney()
  const [videoBlockUpdate] = useMutation<VideoBlockUpdate>(VIDEO_BLOCK_UPDATE)
  const { enqueueSnackbar } = useSnackbar()

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
      enqueueSnackbar('Video Updated', {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (error) {
      enqueueSnackbar(error, {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  return selectedBlock != null && selectedBlock.__typename === 'VideoBlock' ? (
    <VideoBlockEditor
      selectedBlock={selectedBlock}
      onChange={handleChange}
      showDelete={false}
    />
  ) : (
    <></>
  )
}
