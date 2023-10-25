import { gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import {
  BlockDeleteForBackgroundVideo,
  BlockDeleteForBackgroundVideoVariables
} from '../../../../../../../../../__generated__/BlockDeleteForBackgroundVideo'
import {
  CardBlockVideoBlockCreate,
  CardBlockVideoBlockCreateVariables
} from '../../../../../../../../../__generated__/CardBlockVideoBlockCreate'
import {
  CardBlockVideoBlockUpdate,
  CardBlockVideoBlockUpdateVariables
} from '../../../../../../../../../__generated__/CardBlockVideoBlockUpdate'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/GetJourney'
import { VideoBlockUpdateInput } from '../../../../../../../../../__generated__/globalTypes'
import { blockDeleteUpdate } from '../../../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { VideoBlockEditor } from '../../../../../../VideoBlockEditor'

export const BLOCK_DELETE_FOR_BACKGROUND_VIDEO = gql`
  mutation BlockDeleteForBackgroundVideo(
    $id: ID!
    $journeyId: ID!
    $parentBlockId: ID
  ) {
    blockDelete(id: $id, parentBlockId: $parentBlockId, journeyId: $journeyId) {
      id
      parentOrder
    }
  }
`

export const CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE = gql`
  ${VIDEO_FIELDS}
  mutation CardBlockVideoBlockCreate($input: VideoBlockCreateInput!) {
    videoBlockCreate(input: $input) {
      ...VideoFields
    }
  }
`

export const CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE = gql`
  ${VIDEO_FIELDS}
  mutation CardBlockVideoBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: VideoBlockUpdateInput!
  ) {
    videoBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      ...VideoFields
    }
  }
`

interface BackgroundMediaVideoProps {
  cardBlock: TreeBlock<CardBlock>
}

export function BackgroundMediaVideo({
  cardBlock
}: BackgroundMediaVideoProps): ReactElement {
  const coverBlock =
    (cardBlock?.children.find(
      (child) => child.id === cardBlock?.coverBlockId
    ) as TreeBlock<ImageBlock> | TreeBlock<VideoBlock>) ?? null

  const [videoBlockCreate] = useMutation<
    CardBlockVideoBlockCreate,
    CardBlockVideoBlockCreateVariables
  >(CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE)
  const [videoBlockUpdate] = useMutation<
    CardBlockVideoBlockUpdate,
    CardBlockVideoBlockUpdateVariables
  >(CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE)
  const [videoBlockDelete] = useMutation<
    BlockDeleteForBackgroundVideo,
    BlockDeleteForBackgroundVideoVariables
  >(BLOCK_DELETE_FOR_BACKGROUND_VIDEO)

  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const videoBlock = coverBlock?.__typename === 'VideoBlock' ? coverBlock : null

  const createVideoBlock = async (
    input: VideoBlockUpdateInput
  ): Promise<void> => {
    if (journey == null) return

    await videoBlockCreate({
      variables: {
        input: {
          journeyId: journey.id,
          parentBlockId: cardBlock.id,
          isCover: true,
          ...input
        }
      },
      update(cache, { data }) {
        if (data?.videoBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                const newBlockRef = cache.writeFragment({
                  id: `VideoBlock:${data.videoBlockCreate.id}`,
                  data: data.videoBlockCreate,
                  fragment: gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                })
                return [...existingBlockRefs, newBlockRef]
              }
            }
          })
          cache.modify({
            id: cache.identify({
              __typename: cardBlock.__typename,
              id: cardBlock.id
            }),
            fields: {
              coverBlockId: () => data.videoBlockCreate.id
            }
          })
        }
      }
    })
  }

  const updateVideoBlock = async (
    input: VideoBlockUpdateInput
  ): Promise<void> => {
    if (journey == null) return

    if (input.videoId === null) {
      await videoBlockDelete({
        variables: {
          id: coverBlock.id,
          parentBlockId: cardBlock.parentBlockId,
          journeyId: journey.id
        },
        update(cache, { data }) {
          blockDeleteUpdate(coverBlock, data?.blockDelete, cache, journey.id)
        }
      })
    } else {
      await videoBlockUpdate({
        variables: {
          id: coverBlock.id,
          journeyId: journey.id,
          input
        }
      })
    }
  }

  const handleChange = async (block: TreeBlock<VideoBlock>): Promise<void> => {
    try {
      if (videoBlock == null) {
        await createVideoBlock(block)
      } else {
        await updateVideoBlock(block)
      }
      enqueueSnackbar('Video Updated', {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (e) {
      enqueueSnackbar(e.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  return (
    <VideoBlockEditor
      selectedBlock={
        videoBlock != null ? { ...videoBlock, parentOrder: null } : videoBlock
      }
      onChange={handleChange}
    />
  )
}
