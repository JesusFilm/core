import { gql, useMutation } from '@apollo/client'
import { ReactElement, useState } from 'react'

import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import {
  JourneyImageBlockAssociationUpdate,
  JourneyImageBlockAssociationUpdateVariables
} from '../../../../__generated__/JourneyImageBlockAssociationUpdate'
import {
  JourneyImageBlockCreate,
  JourneyImageBlockCreateVariables
} from '../../../../__generated__/JourneyImageBlockCreate'
import {
  JourneyImageBlockDelete,
  JourneyImageBlockDeleteVariables
} from '../../../../__generated__/JourneyImageBlockDelete'
import {
  JourneyImageBlockUpdate,
  JourneyImageBlockUpdateVariables
} from '../../../../__generated__/JourneyImageBlockUpdate'
import { blockDeleteUpdate } from '../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { ImageLibrary } from '../ImageLibrary'

import { Large } from './Large'
import { Small } from './Small'

export const JOURNEY_IMAGE_BLOCK_DELETE = gql`
  mutation JourneyImageBlockDelete($id: ID!, $journeyId: ID!) {
    blockDelete(id: $id, journeyId: $journeyId) {
      id
      parentOrder
    }
  }
`

export const JOURNEY_IMAGE_BLOCK_CREATE = gql`
  ${IMAGE_FIELDS}
  mutation JourneyImageBlockCreate($input: ImageBlockCreateInput!) {
    imageBlockCreate(input: $input) {
      ...ImageFields
    }
  }
`

export const JOURNEY_IMAGE_BLOCK_UPDATE = gql`
  ${IMAGE_FIELDS}
  mutation JourneyImageBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      ...ImageFields
    }
  }
`

export const JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE = gql`
  mutation JourneyImageBlockAssociationUpdate(
    $id: ID!
    $input: JourneyUpdateInput!
  ) {
    journeyUpdate(id: $id, input: $input) {
      id
      primaryImageBlock {
        id
      }
      creatorImageBlock {
        id
      }
    }
  }
`

interface ImageEditProps {
  size?: 'small' | 'large'
  target?: 'primary' | 'creator'
  variant?: 'drawer' | 'dialog'
}

export function ImageEdit({
  size = 'large',
  target = 'primary',
  variant = 'drawer'
}: ImageEditProps): ReactElement {
  const [journeyImageBlockDelete] = useMutation<
    JourneyImageBlockDelete,
    JourneyImageBlockDeleteVariables
  >(JOURNEY_IMAGE_BLOCK_DELETE)
  const [
    journeyImageBlockCreate,
    { loading: createLoading, error: createError }
  ] = useMutation<JourneyImageBlockCreate, JourneyImageBlockCreateVariables>(
    JOURNEY_IMAGE_BLOCK_CREATE
  )
  const [
    journeyImageBlockUpdate,
    { loading: updateLoading, error: updateError }
  ] = useMutation<JourneyImageBlockUpdate, JourneyImageBlockUpdateVariables>(
    JOURNEY_IMAGE_BLOCK_UPDATE
  )
  const [journeyImageBlockAssociationUpdate] = useMutation<
    JourneyImageBlockAssociationUpdate,
    JourneyImageBlockAssociationUpdateVariables
  >(JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE)
  const { journey } = useJourney()
  const [open, setOpen] = useState(false)
  const targetImageBlock =
    target === 'primary'
      ? journey?.primaryImageBlock
      : journey?.creatorImageBlock

  function handleOpen(): void {
    setOpen(true)
  }
  function handleClose(): void {
    setOpen(false)
  }

  async function createImageBlock(imageBlock: ImageBlock): Promise<void> {
    if (journey == null) return

    const { data } = await journeyImageBlockCreate({
      variables: {
        input: {
          journeyId: journey.id,
          src: imageBlock.src,
          alt: imageBlock.alt,
          blurhash: imageBlock.blurhash,
          width: imageBlock.width,
          height: imageBlock.height
        }
      }
    })
    if (data?.imageBlockCreate != null) {
      await journeyImageBlockAssociationUpdate({
        variables: {
          id: journey.id,
          input:
            target === 'primary'
              ? {
                  primaryImageBlockId: data.imageBlockCreate.id
                }
              : {
                  creatorImageBlockId: data.imageBlockCreate.id
                }
        }
      })
    }
  }

  async function updateImageBlock(imageBlock: ImageBlock): Promise<void> {
    if (journey == null) return

    await journeyImageBlockUpdate({
      variables: {
        id: imageBlock.id,
        journeyId: journey?.id,
        input: {
          src: imageBlock.src,
          alt: imageBlock.alt,
          blurhash: imageBlock.blurhash,
          width: imageBlock.width,
          height: imageBlock.height
        }
      }
    })
  }

  async function handleDelete(): Promise<void> {
    if (journey == null || targetImageBlock == null) return

    const { data } = await journeyImageBlockDelete({
      variables: {
        id: targetImageBlock.id,
        journeyId: journey.id
      },
      update(cache, { data }) {
        blockDeleteUpdate(
          targetImageBlock,
          data?.blockDelete,
          cache,
          journey.id
        )
      }
    })
    if (data?.blockDelete != null) {
      await journeyImageBlockAssociationUpdate({
        variables: {
          id: journey.id,
          input:
            target === 'primary'
              ? {
                  primaryImageBlockId: null
                }
              : {
                  creatorImageBlockId: null
                }
        }
      })
    }
  }

  async function handleChange(imageBlock: ImageBlock): Promise<void> {
    if (imageBlock.src === '') return

    if (imageBlock.id == null) {
      await createImageBlock(imageBlock)
    } else {
      await updateImageBlock(imageBlock)
    }

    handleClose()
  }

  return (
    <>
      {size === 'large' ? (
        <Large
          loading={journey == null}
          imageBlock={targetImageBlock}
          onClick={handleOpen}
        />
      ) : (
        <Small
          loading={journey == null}
          imageBlock={targetImageBlock}
          onClick={handleOpen}
        />
      )}
      <ImageLibrary
        variant={variant}
        selectedBlock={targetImageBlock ?? null}
        open={open}
        onClose={handleClose}
        onChange={handleChange}
        onDelete={handleDelete}
        loading={createLoading || updateLoading}
        error={createError != null ?? updateError != null}
      />
    </>
  )
}
