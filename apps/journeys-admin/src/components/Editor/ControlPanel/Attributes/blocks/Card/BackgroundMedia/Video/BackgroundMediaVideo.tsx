import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
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
  mutation CardBlockVideoBlockCreate($input: VideoBlockCreateInput!) {
    videoBlockCreate(input: $input) {
      id
      startAt
      endAt
      muted
      autoplay
      video {
        variant {
          hls
        }
      }
      posterBlockId
    }
  }
`

export const CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE = gql`
  mutation CardBlockVideoBlockUpdate(
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
      video {
        variant {
          hls
        }
      }
      posterBlockId
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
  const [VideoBlockCreate] = useMutation<CardBlockVideoBlockCreate>(
    CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE
  )
  const [VideoBlockUpdate] = useMutation<CardBlockVideoBlockUpdate>(
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

  const createVideoBlock = async (block): Promise<void> => {
    const { data } = await VideoBlockCreate({
      variables: {
        input: {
          journeyId: journeyId,
          parentBlockId: cardBlock.id,
          title: block.title ?? block.videoContent.src,
          startAt: block.startAt,
          endAt: (block.endAt ?? 0) > (block.startAt ?? 0) ? block.endAt : null,
          muted: block.muted,
          autoplay: block.autoplay,
          posterBlockId: block.posterBlockId,
          videoContent: block.videoContent
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
      id: coverBlock.id,
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
    if (
      videoContent.src !==
      (coverBlock as TreeBlock<VideoBlock>).videoContent.src
    ) {
      variables = {
        ...variables,
        input: { ...variables.input, videoContent: { src: videoContent.src } }
      }
    }
    await VideoBlockUpdate({
      variables,
      optimisticResponse: {
        videoBlockUpdate: {
          id: coverBlock.id,
          ...block,
          __typename: 'VideoBlock',
          endAt: (block.endAt ?? 0) > (block.startAt ?? 0) ? block.endAt : null,
          videoContent
        }
      }
    })
  }

  const handleChange = async (block: TreeBlock<VideoBlock>): Promise<void> => {
    if (
      coverBlock != null &&
      coverBlock?.__typename.toString() !== 'VideoBlock'
    ) {
      // remove existing cover block if type changed
      await deleteCoverBlock()
    }
    if (videoBlock == null) {
      await createVideoBlock(block)
    } else {
      await updateVideoBlock(block)
    }
  }

  return (
    <VideoBlockEditor
      selectedBlock={videoBlock}
      onChange={handleChange}
      onDelete={deleteCoverBlock}
      parentBlockId={cardBlock.id}
      parentOrder={cardBlock.parentOrder ?? 0}
      forBackground
    />
  )
}
