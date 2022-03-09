import { ReactElement } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/GetJourney'
import { VideoBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { VideoBlockEditor } from '../../../../../VideoBlockEditor'
import { blockDeleteUpdate } from '../../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { VideoBlockUpdate } from '../../../../../../../../__generated__/VideoBlockUpdate'
import { BlockDeleteForVideo } from '../../../../../../../../__generated__/BlockDeleteForVideo'
import { useJourney } from '../../../../../../../libs/context'

export const BLOCK_DELETE_FOR_VIDEO = gql`
  mutation BlockDeleteForVideo($id: ID!, $parentBlockId: ID!, $journeyId: ID!) {
    blockDelete(id: $id, parentBlockId: $parentBlockId, journeyId: $journeyId) {
      id
    }
  }
`

export const VIDEO_BLOCK_UPDATE = gql`
  mutation VideoBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: VideoBlockUpdateInput!
  ) {
    videoBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      title
      startAt
      endAt
      muted
      autoplay
      videoContent {
        src
      }
      posterBlockId
    }
  }
`

export function VideoOptions(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()
  const { id: journeyId } = useJourney()
  const [VideoBlockUpdate] = useMutation<VideoBlockUpdate>(VIDEO_BLOCK_UPDATE)
  const [blockDelete] = useMutation<BlockDeleteForVideo>(BLOCK_DELETE_FOR_VIDEO)
  const videoBlock = selectedBlock as TreeBlock<VideoBlock>

  const deleteVideoBlock = async (): Promise<void> => {
    await blockDelete({
      variables: {
        id: videoBlock.id,
        parentBlockId: videoBlock.parentBlockId,
        journeyId: journeyId
      },
      update(cache, { data }) {
        blockDeleteUpdate(videoBlock, data?.blockDelete, cache, journeyId)
      }
    })
  }

  const updateVideoBlock = async (block): Promise<void> => {
    if (block == null) return

    const videoContent = {
      src: block.videoContent.src,
      __typename: block.videoContent.__typename ?? 'VideoGeneric'
    }
    let variables: {
      id: string
      journeyId: string
      input: VideoBlockUpdateInput
    } = {
      id: videoBlock.id,
      journeyId: journeyId,
      input: {
        title: block.title,
        startAt: block.startAt,
        endAt: (block.endAt ?? 0) > (block.startAt ?? 0) ? block.endAt : null,
        muted: block.muted,
        autoplay: block.autoplay,
        posterBlockId: block.posterBlockId
      }
    }
    // Don't update Arclight with src
    if (videoContent.src !== videoBlock.videoContent.src) {
      variables = {
        ...variables,
        input: { ...variables.input, videoContent: { src: videoContent.src } }
      }
    }
    await VideoBlockUpdate({
      variables,
      optimisticResponse: {
        videoBlockUpdate: {
          id: videoBlock.id,
          ...block,
          __typename: 'VideoBlock',
          endAt: (block.endAt ?? 0) > (block.startAt ?? 0) ? block.endAt : null,
          videoContent
        }
      }
    })
  }

  const handleChange = async (block: TreeBlock<VideoBlock>): Promise<void> => {
    await updateVideoBlock(block)
  }

  return (
    <VideoBlockEditor
      selectedBlock={videoBlock}
      onChange={handleChange}
      onDelete={deleteVideoBlock}
      parentBlockId={videoBlock.parentBlockId}
      parentOrder={0}
    />
  )
}
