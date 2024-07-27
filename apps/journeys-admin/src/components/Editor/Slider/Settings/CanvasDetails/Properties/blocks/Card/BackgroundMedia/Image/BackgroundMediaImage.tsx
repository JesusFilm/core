import { gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockDeleteForBackgroundImage,
  BlockDeleteForBackgroundImageVariables
} from '../../../../../../../../../../../__generated__/BlockDeleteForBackgroundImage'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
import {
  CardBlockImageBlockCreate,
  CardBlockImageBlockCreateVariables
} from '../../../../../../../../../../../__generated__/CardBlockImageBlockCreate'
import {
  CardBlockImageBlockUpdate,
  CardBlockImageBlockUpdateVariables
} from '../../../../../../../../../../../__generated__/CardBlockImageBlockUpdate'
import { ImageBlockUpdateInput } from '../../../../../../../../../../../__generated__/globalTypes'
import { blockDeleteUpdate } from '../../../../../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { ImageSource } from '../../../../../../Drawer/ImageSource'

export const BLOCK_DELETE_FOR_BACKGROUND_IMAGE = gql`
  mutation BlockDeleteForBackgroundImage(
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

  const imageCover = coverBlock?.__typename === 'ImageBlock' ? coverBlock : null

  const [imageBlockCreate, { loading: createLoading, error: createError }] =
    useMutation<CardBlockImageBlockCreate, CardBlockImageBlockCreateVariables>(
      CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE
    )
  const [imageBlockUpdate, { loading: updateLoading, error: updateError }] =
    useMutation<CardBlockImageBlockUpdate, CardBlockImageBlockUpdateVariables>(
      CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE
    )
  const [imageBlockDelete] = useMutation<
    BlockDeleteForBackgroundImage,
    BlockDeleteForBackgroundImageVariables
  >(BLOCK_DELETE_FOR_BACKGROUND_IMAGE)
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()

  const handleImageDelete = async (): Promise<void> => {
    try {
      await deleteCoverBlock()
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }

  const deleteCoverBlock = async (): Promise<void> => {
    if (journey == null) return

    await imageBlockDelete({
      variables: {
        id: coverBlock.id,
        parentBlockId: cardBlock.parentBlockId,
        journeyId: journey.id
      },
      update(cache, { data }) {
        blockDeleteUpdate(coverBlock, data?.blockDelete, cache, journey.id)
      }
    })
  }

  const createImageBlock = async (
    input: ImageBlockUpdateInput
  ): Promise<void> => {
    if (journey == null) return

    if (coverBlock != null && coverBlock.__typename === 'VideoBlock')
      await deleteCoverBlock()

    await imageBlockCreate({
      variables: {
        input: {
          journeyId: journey.id,
          parentBlockId: cardBlock.id,
          isCover: true,
          ...input,
          alt: input.alt ?? 'background media image'
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
          cache.modify({
            id: cache.identify({
              __typename: cardBlock.__typename,
              id: cardBlock.id
            }),
            fields: {
              coverBlockId: () => data.imageBlockCreate.id
            }
          })
        }
      }
    })
  }

  const updateImageBlock = async (
    input: ImageBlockUpdateInput
  ): Promise<void> => {
    if (journey == null) return
    await imageBlockUpdate({
      variables: {
        id: coverBlock.id,
        journeyId: journey.id,
        input
      }
    })
  }

  const handleChange = async (input: ImageBlockUpdateInput): Promise<void> => {
    try {
      if (input.src === '') return

      if (imageCover == null) {
        await createImageBlock(input)
      } else {
        await updateImageBlock(input)
      }
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }

  return (
    <ImageSource
      selectedBlock={imageCover}
      onChange={handleChange}
      onDelete={handleImageDelete}
      loading={createLoading || updateLoading}
      error={createError != null ?? updateError != null}
    />
  )
}
