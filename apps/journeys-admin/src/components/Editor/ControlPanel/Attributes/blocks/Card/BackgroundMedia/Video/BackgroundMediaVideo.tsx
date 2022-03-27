import { ReactElement } from 'react'
import { TreeBlock, VIDEO_FIELDS } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/GetJourney'
import { useJourney } from '../../../../../../../../libs/context'
import { VideoBlockUpdateInput } from '../../../../../../../../../__generated__/globalTypes'
import { BlockDeleteForBackgroundVideo } from '../../../../../../../../../__generated__/BlockDeleteForBackgroundVideo'
import { CardBlockBackgroundVideoUpdate } from '../../../../../../../../../__generated__/CardBlockBackgroundVideoUpdate'
import { CardBlockVideoBlockCreate } from '../../../../../../../../../__generated__/CardBlockVideoBlockCreate'
import { CardBlockVideoBlockUpdate } from '../../../../../../../../../__generated__/CardBlockVideoBlockUpdate'
import { VideoBlockEditor } from '../../../../../../VideoBlockEditor'
import { blockDeleteUpdate } from '../../../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'

export const BLOCK_DELETE_FOR_BACKGROUND_VIDEO = gql`
  mutation BlockDeleteForBackgroundVideo(
    $id: ID!
    $parentBlockId: ID!
    $journeyId: ID!
  ) {
    blockDelete(id: $id, parentBlockId: $parentBlockId, journeyId: $journeyId) {
      id
      parentOrder
    }
  }
`

export const CARD_BLOCK_COVER_VIDEO_UPDATE = gql`
  mutation CardBlockBackgroundVideoUpdate(
    $id: ID!
    $journeyId: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      coverBlockId
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

  const [cardBlockUpdate] = useMutation<CardBlockBackgroundVideoUpdate>(
    CARD_BLOCK_COVER_VIDEO_UPDATE
  )
  const [videoBlockCreate] = useMutation<CardBlockVideoBlockCreate>(
    CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE
  )
  const [videoBlockUpdate] = useMutation<CardBlockVideoBlockUpdate>(
    CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE
  )
  const [blockDelete] = useMutation<BlockDeleteForBackgroundVideo>(
    BLOCK_DELETE_FOR_BACKGROUND_VIDEO
  )
  const { id: journeyId } = useJourney()
  const videoBlock = coverBlock?.__typename === 'VideoBlock' ? coverBlock : null

  const deleteCoverBlock = async (): Promise<void> => {
    await blockDelete({
      variables: {
        id: coverBlock.id,
        parentBlockId: coverBlock.parentBlockId,
        journeyId: journeyId
      },
      update(cache, { data }) {
        blockDeleteUpdate(coverBlock, data?.blockDelete, cache, journeyId)
      }
    })
    await cardBlockUpdate({
      variables: {
        id: cardBlock.id,
        journeyId: journeyId,
        input: {
          coverBlockId: null
        }
      },
      optimisticResponse: {
        cardBlockUpdate: {
          id: cardBlock.id,
          coverBlockId: null,
          __typename: 'CardBlock'
        }
      }
    })
  }

  const createVideoBlock = async (
    input: VideoBlockUpdateInput
  ): Promise<void> => {
    const { data } = await videoBlockCreate({
      variables: {
        input: {
          journeyId: journeyId,
          parentBlockId: cardBlock.id,
          ...input
        }
      },
      update(cache, { data }) {
        if (data?.videoBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journeyId }),
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
        }
      }
    })
    await cardBlockUpdate({
      variables: {
        id: cardBlock.id,
        journeyId: journeyId,
        input: {
          coverBlockId: data?.videoBlockCreate?.id ?? null
        }
      },
      optimisticResponse: {
        cardBlockUpdate: {
          id: cardBlock.id,
          coverBlockId: data?.videoBlockCreate?.id ?? null,
          __typename: 'CardBlock'
        }
      }
    })
  }

  const updateVideoBlock = async (
    input: VideoBlockUpdateInput
  ): Promise<void> => {
    await videoBlockUpdate({
      variables: {
        id: coverBlock.id,
        journeyId: journeyId,
        input
      }
    })
  }

  const handleChange = async (input: VideoBlockUpdateInput): Promise<void> => {
    if (coverBlock != null && coverBlock.__typename !== 'VideoBlock') {
      // remove existing cover block if type changed
      await deleteCoverBlock()
    }
    if (videoBlock == null) {
      await createVideoBlock(input)
    } else {
      await updateVideoBlock(input)
    }
  }

  return (
    <VideoBlockEditor
      selectedBlock={videoBlock}
      onChange={handleChange}
      onDelete={deleteCoverBlock}
    />
  )
}
