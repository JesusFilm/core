import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import { TreeBlock } from '@core/journeys/ui'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/GetJourney'
import { useJourney } from '../../../../../../../../libs/context'
import { CardBlockBackgroundImageUpdate } from '../../../../../../../../../__generated__/CardBlockBackgroundImageUpdate'
import { CardBlockImageBlockCreate } from '../../../../../../../../../__generated__/CardBlockImageBlockCreate'
import { CardBlockImageBlockUpdate } from '../../../../../../../../../__generated__/CardBlockImageBlockUpdate'
import { BlockDeleteForBackgroundImage } from '../../../../../../../../../__generated__/BlockDeleteForBackgroundImage'
import { ImageBlockEditor } from '../../../../../../ImageBlockEditor'
import { blockDeleteUpdate } from '../../../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'

export const BLOCK_DELETE_FOR_BACKGROUND_IMAGE = gql`
  mutation BlockDeleteForBackgroundImage(
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

export const CARD_BLOCK_COVER_IMAGE_UPDATE = gql`
  mutation CardBlockBackgroundImageUpdate(
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

export const CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE = gql`
  mutation CardBlockImageBlockCreate($input: ImageBlockCreateInput!) {
    imageBlockCreate(input: $input) {
      id
      src
      alt
      parentBlockId
      width
      height
      parentOrder
      blurhash
    }
  }
`

export const CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE = gql`
  mutation CardBlockImageBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      src
      alt
      width
      height
      parentOrder
      blurhash
    }
  }
`
interface BackgroundMediaImageProps {
  cardBlock: TreeBlock<CardBlock>
}

export function BackgroundMediaImage({
  cardBlock
}: BackgroundMediaImageProps): ReactElement {
  const coverBlock =
    (cardBlock?.children.find(
      (child) => child.id === cardBlock?.coverBlockId
    ) as TreeBlock<ImageBlock> | TreeBlock<VideoBlock>) ?? null

  const imageBlock = coverBlock?.__typename === 'ImageBlock' ? coverBlock : null

  const [cardBlockUpdate, { error: cardBlockUpdateError }] =
    useMutation<CardBlockBackgroundImageUpdate>(CARD_BLOCK_COVER_IMAGE_UPDATE)
  const [imageBlockCreate, { error: imageBlockCreateError }] =
    useMutation<CardBlockImageBlockCreate>(CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE)
  const [imageBlockUpdate, { error: imageBlockUpdateError }] =
    useMutation<CardBlockImageBlockUpdate>(CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE)
  const [blockDelete, { error: blockDeleteError }] =
    useMutation<BlockDeleteForBackgroundImage>(
      BLOCK_DELETE_FOR_BACKGROUND_IMAGE
    )
  const journey = useJourney()

  const handleImageDelete = async (): Promise<void> => {
    await deleteCoverBlock()
  }

  const deleteCoverBlock = async (): Promise<boolean> => {
    if (journey == null) return false

    await blockDelete({
      variables: {
        id: coverBlock.id,
        parentBlockId: cardBlock.parentBlockId,
        journeyId: journey.id
      },
      update(cache, { data }) {
        blockDeleteUpdate(coverBlock, data?.blockDelete, cache, journey.id)
      }
    })

    if (blockDeleteError != null) return false

    await cardBlockUpdate({
      variables: {
        id: cardBlock.id,
        journeyId: journey.id,
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
    return cardBlockUpdateError == null
  }

  const createImageBlock = async (block): Promise<boolean> => {
    if (journey == null) return false

    const { data } = await imageBlockCreate({
      variables: {
        input: {
          journeyId: journey.id,
          parentBlockId: cardBlock.id,
          src: block.src,
          alt: block.alt
        }
      },
      update(cache, { data }) {
        if (data?.imageBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                const newBlockRef = cache.writeFragment({
                  data: data.imageBlockCreate,
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

    if (imageBlockCreateError != null) return false

    await cardBlockUpdate({
      variables: {
        id: cardBlock.id,
        journeyId: journey.id,
        input: {
          coverBlockId: data?.imageBlockCreate.id ?? null
        }
      },
      optimisticResponse: {
        cardBlockUpdate: {
          id: cardBlock.id,
          coverBlockId: data?.imageBlockCreate.id ?? null,
          __typename: 'CardBlock'
        }
      }
    })
    return cardBlockUpdateError == null
  }

  const updateImageBlock = async (block: ImageBlock): Promise<boolean> => {
    if (journey == null) return false

    await imageBlockUpdate({
      variables: {
        id: coverBlock.id,
        journeyId: journey.id,
        input: {
          src: block.src,
          alt: block.alt
        }
      }
    })
    return imageBlockUpdateError == null
  }

  const handleChange = async (block: ImageBlock): Promise<void> => {
    let success = true
    if (
      coverBlock != null &&
      coverBlock?.__typename.toString() !== 'ImageBlock'
    ) {
      // remove existing cover block if type changed
      success = await deleteCoverBlock()
    }

    if (block.src === '' || !success) return

    if (imageBlock == null) {
      await createImageBlock(block)
    } else {
      await updateImageBlock(block)
    }
  }

  return (
    <ImageBlockEditor
      selectedBlock={imageBlock}
      onChange={handleChange}
      onDelete={handleImageDelete}
    />
  )
}
