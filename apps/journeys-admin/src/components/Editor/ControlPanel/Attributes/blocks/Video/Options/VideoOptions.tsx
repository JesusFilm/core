import { ReactElement } from 'react'
import { useEditor, TreeBlock, VIDEO_FIELDS } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import { pick } from 'lodash'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/GetJourney'
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
  const { id: journeyId } = useJourney()
  const [videoBlockUpdate] = useMutation<VideoBlockUpdate>(VIDEO_BLOCK_UPDATE)

  const handleChange = async (block: TreeBlock<VideoBlock>): Promise<void> => {
    if (block == null || selectedBlock == null) return

    const variables: {
      id: string
      journeyId: string
      input: VideoBlockUpdateInput
    } = {
      id: selectedBlock.id,
      journeyId: journeyId,
      input: {
        ...pick(block, [
          'autoplay',
          'fullsize',
          'muted',
          'startAt',
          'videoId',
          'videoVariantLanguageId'
        ]),
        endAt: (block.endAt ?? 0) > (block.startAt ?? 0) ? block.endAt : null
      }
    }
    await videoBlockUpdate({ variables })
  }

  return selectedBlock != null ? (
    <VideoBlockEditor
      selectedBlock={selectedBlock as TreeBlock<VideoBlock>}
      onChange={handleChange}
      showDelete={false}
      parentBlockId={selectedBlock.parentBlockId}
      parentOrder={selectedBlock.parentOrder}
    />
  ) : (
    <></>
  )
}
