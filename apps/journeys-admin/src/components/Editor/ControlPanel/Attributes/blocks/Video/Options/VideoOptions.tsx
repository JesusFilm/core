import { ReactElement } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/GetJourney'
import { VideoBlockUpdateInput } from '../../../../../../../../__generated__/globalTypes'
import { VideoBlockEditor } from '../../../../../VideoBlockEditor'
import { VideoBlockUpdate } from '../../../../../../../../__generated__/VideoBlockUpdate'
import { useJourney } from '../../../../../../../libs/context'

export const VIDEO_BLOCK_UPDATE = gql`
  mutation VideoBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: VideoBlockUpdateInput!
  ) {
    videoBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      startAt
      endAt
      muted
      autoplay
      videoId
      videoVariantLanguageId
      video {
        variant {
          hls
        }
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
  const videoBlock = selectedBlock as TreeBlock<VideoBlock>

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
      showDelete={false}
      parentBlockId={videoBlock.parentBlockId ?? '0'}
      parentOrder={0}
    />
  )
}
