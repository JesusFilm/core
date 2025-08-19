import { gql, useMutation } from '@apollo/client'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ImageBlockUpdateInput } from '../../../../../../../__generated__/globalTypes'
import {
  JourneyImageBlockAssociationUpdate,
  JourneyImageBlockAssociationUpdateVariables
} from '../../../../../../../__generated__/JourneyImageBlockAssociationUpdate'
import {
  JourneyImageBlockCreate,
  JourneyImageBlockCreateVariables
} from '../../../../../../../__generated__/JourneyImageBlockCreate'
import {
  JourneyImageBlockDelete,
  JourneyImageBlockDeleteVariables
} from '../../../../../../../__generated__/JourneyImageBlockDelete'
import {
  JourneyImageBlockUpdate,
  JourneyImageBlockUpdateVariables
} from '../../../../../../../__generated__/JourneyImageBlockUpdate'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'

import { Large } from './Large'
import { Small } from './Small'

const ImageLibrary = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ImageLibrary/ImageLibrary" */ '../ImageLibrary'
    ).then((mod) => mod.ImageLibrary),
  { ssr: false }
)

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
  const [open, setOpen] = useState<boolean | undefined>()
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

  async function createImageBlock(input: ImageBlockUpdateInput): Promise<void> {
    if (journey == null) return

    const { data } = await journeyImageBlockCreate({
      variables: {
        input: {
          journeyId: journey.id,
          ...input,
          alt: input.alt ?? 'journey image'
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

  async function updateImageBlock(input: ImageBlockUpdateInput): Promise<void> {
    if (journey == null || targetImageBlock == null) return

    await journeyImageBlockUpdate({
      variables: {
        id: targetImageBlock.id,
        journeyId: journey.id,
        input
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
      optimisticResponse: {
        blockDelete: [
          {
            __typename: 'ImageBlock',
            id: targetImageBlock.id,
            parentOrder: targetImageBlock.parentOrder
          }
        ]
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

  async function handleChange(input: ImageBlockUpdateInput): Promise<void> {
    if (input.src === '') return

    if (targetImageBlock?.id == null) {
      await createImageBlock(input)
    } else {
      await updateImageBlock(input)
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
      {open != null && (
        <ImageLibrary
          variant={variant}
          selectedBlock={targetImageBlock ?? null}
          open={open}
          onClose={handleClose}
          onChange={handleChange}
          onDelete={handleDelete}
          loading={createLoading || updateLoading}
          error={createError != null || updateError != null}
        />
      )}
    </>
  )
}
