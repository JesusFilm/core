import { gql, useMutation } from '@apollo/client'
import { ReactElement, useEffect } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockDeleteForPosterImage } from '../../../../../../../__generated__/BlockDeleteForPosterImage'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../__generated__/GetJourney'
import { PosterImageBlockCreate } from '../../../../../../../__generated__/PosterImageBlockCreate'
import { PosterImageBlockUpdate } from '../../../../../../../__generated__/PosterImageBlockUpdate'
import { VideoBlockPosterImageUpdate } from '../../../../../../../__generated__/VideoBlockPosterImageUpdate'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { ImageLibrary } from '../../../../ImageLibrary'

export const BLOCK_DELETE_FOR_POSTER_IMAGE = gql`
  mutation BlockDeleteForPosterImage(
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

export const VIDEO_BLOCK_POSTER_IMAGE_UPDATE = gql`
  mutation VideoBlockPosterImageUpdate(
    $id: ID!
    $journeyId: ID!
    $input: VideoBlockUpdateInput!
  ) {
    videoBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      posterBlockId
    }
  }
`

export const POSTER_IMAGE_BLOCK_CREATE = gql`
  mutation PosterImageBlockCreate($input: ImageBlockCreateInput!) {
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

export const POSTER_IMAGE_BLOCK_UPDATE = gql`
  mutation PosterImageBlockUpdate(
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

interface VideoBlockEditorSettingsPosterLibraryProps {
  selectedBlock: ImageBlock | null
  parentBlockId: string | undefined
  open: boolean
  onClose: () => void
  onLoading?: () => void
  onLoad?: () => void
}

export function VideoBlockEditorSettingsPosterLibrary({
  selectedBlock,
  parentBlockId,
  open,
  onClose,
  onLoading,
  onLoad
}: VideoBlockEditorSettingsPosterLibraryProps): ReactElement {
  const { journey } = useJourney()

  const [blockDelete, { error: blockDeleteError }] =
    useMutation<BlockDeleteForPosterImage>(BLOCK_DELETE_FOR_POSTER_IMAGE)
  const [videoBlockUpdate, { error: videoBlockUpdateError }] =
    useMutation<VideoBlockPosterImageUpdate>(VIDEO_BLOCK_POSTER_IMAGE_UPDATE)
  const [
    imageBlockCreate,
    { error: imageBlockCreateError, loading: createLoading, error: createError }
  ] = useMutation<PosterImageBlockCreate>(POSTER_IMAGE_BLOCK_CREATE)
  const [
    imageBlockUpdate,
    { error: imageBlockUpdateError, loading: updateLoading, error: updateError }
  ] = useMutation<PosterImageBlockUpdate>(POSTER_IMAGE_BLOCK_UPDATE)

  useEffect(() => {
    if (createLoading || updateLoading) {
      onLoading?.()
    } else {
      onLoad?.()
    }
    // eslint-disable-next-line
  }, [createLoading, updateLoading])

  const deleteCoverBlock = async (): Promise<void> => {
    if (selectedBlock == null || parentBlockId == null || journey == null)
      return

    await blockDelete({
      variables: {
        id: selectedBlock.id,
        parentBlockId: selectedBlock.parentBlockId,
        journeyId: journey.id
      },
      update(cache, { data }) {
        blockDeleteUpdate(selectedBlock, data?.blockDelete, cache, journey.id)
      }
    })
    if (blockDeleteError != null) return

    await videoBlockUpdate({
      variables: {
        id: parentBlockId,
        journeyId: journey.id,
        input: {
          posterBlockId: null
        }
      },
      optimisticResponse: {
        videoBlockUpdate: {
          id: parentBlockId,
          posterBlockId: null,
          __typename: 'VideoBlock'
        }
      }
    })
  }

  const createImageBlock = async (block): Promise<boolean> => {
    if (parentBlockId == null || journey == null) return false

    const { data } = await imageBlockCreate({
      variables: {
        input: {
          journeyId: journey.id,
          parentBlockId,
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

    await videoBlockUpdate({
      variables: {
        id: parentBlockId,
        journeyId: journey.id,
        input: {
          posterBlockId: data?.imageBlockCreate.id ?? null
        }
      },
      optimisticResponse: {
        videoBlockUpdate: {
          id: parentBlockId,
          posterBlockId: data?.imageBlockCreate.id ?? null,
          __typename: 'VideoBlock'
        }
      }
    })
    return videoBlockUpdateError == null
  }

  const updateImageBlock = async (block: ImageBlock): Promise<boolean> => {
    if (selectedBlock == null || journey == null) return false

    await imageBlockUpdate({
      variables: {
        id: selectedBlock.id,
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
    if (block.src === '') return

    if (selectedBlock == null) {
      await createImageBlock(block)
    } else {
      await updateImageBlock(block)
    }
  }

  return (
    <>
      {open != null && (
        <ImageLibrary
          open={open}
          onClose={onClose}
          onChange={handleChange}
          onDelete={deleteCoverBlock}
          loading={createLoading || updateLoading}
          selectedBlock={selectedBlock}
          error={createError != null ?? updateError != null}
        />
      )}
    </>
  )
}
