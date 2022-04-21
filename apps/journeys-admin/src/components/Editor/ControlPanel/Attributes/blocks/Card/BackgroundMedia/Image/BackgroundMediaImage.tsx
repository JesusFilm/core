import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import { TreeBlock } from '@core/journeys/ui'
import { useSnackbar } from 'notistack'
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

  const [cardBlockUpdate] = useMutation<CardBlockBackgroundImageUpdate>(
    CARD_BLOCK_COVER_IMAGE_UPDATE
  )
  const [imageBlockCreate] = useMutation<CardBlockImageBlockCreate>(
    CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE
  )
  const [imageBlockUpdate] = useMutation<CardBlockImageBlockUpdate>(
    CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE
  )
  const [blockDelete] = useMutation<BlockDeleteForBackgroundImage>(
    BLOCK_DELETE_FOR_BACKGROUND_IMAGE
  )
  const journey = useJourney()
  const { enqueueSnackbar } = useSnackbar()

  const handleImageDelete = async (): Promise<void> => {
    try {
      await deleteCoverBlock()
      enqueueSnackbar('Image Deleted', {
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

  const deleteCoverBlock = async (): Promise<void> => {
    if (journey == null) return

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
  }

  const createImageBlock = async (block): Promise<void> => {
    if (journey == null) return

    await imageBlockCreate({
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
  }

  const updateImageBlock = async (block: ImageBlock): Promise<void> => {
    if (journey == null) return

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
  }

  const handleChange = async (block: ImageBlock): Promise<void> => {
    try {
      if (
        coverBlock != null &&
        coverBlock?.__typename.toString() !== 'ImageBlock'
      ) {
        // remove existing cover block if type changed
        await deleteCoverBlock()
      }

      if (block.src === '') return

      if (imageBlock == null) {
        await createImageBlock(block)
      } else {
        await updateImageBlock(block)
      }
      enqueueSnackbar('Image Updated', {
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
    <ImageBlockEditor
      selectedBlock={imageBlock}
      onChange={handleChange}
      onDelete={handleImageDelete}
    />
  )
}
