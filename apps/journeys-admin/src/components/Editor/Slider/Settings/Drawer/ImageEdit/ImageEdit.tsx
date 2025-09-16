import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ImageBlockUpdateInput } from '../../../../../../../__generated__/globalTypes'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { useJourneyImageBlockAssociationUpdateMutation } from '../../../../../../libs/useJourneyImageBlockAssociationUpdateMutation'
import { useJourneyImageBlockCreateMutation } from '../../../../../../libs/useJourneyImageBlockCreateMutation'
import { useJourneyImageBlockDeleteMutation } from '../../../../../../libs/useJourneyImageBlockDeleteMutation'
import { useJourneyImageBlockUpdateMutation } from '../../../../../../libs/useJourneyImageBlockUpdateMutation'

import { Large } from './Large'
import { Small } from './Small'

const ImageLibrary = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ImageLibrary/ImageLibrary" */ '../ImageLibrary'
    ).then((mod) => mod.ImageLibrary),
  { ssr: false }
)

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
  const [journeyImageBlockDelete] = useJourneyImageBlockDeleteMutation()
  const [
    journeyImageBlockCreate,
    { loading: createLoading, error: createError }
  ] = useJourneyImageBlockCreateMutation()
  const [
    journeyImageBlockUpdate,
    { loading: updateLoading, error: updateError }
  ] = useJourneyImageBlockUpdateMutation()
  const [journeyImageBlockAssociationUpdate] =
    useJourneyImageBlockAssociationUpdateMutation()
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
