import { ReactElement } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'
import { ImageBlockUpdate } from '../../../../../../../../__generated__/ImageBlockUpdate'
import { blockDeleteUpdate } from '../../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { ImageBlockDelete } from '../../../../../../../../__generated__/ImageBlockDelete'
import { ImageBlockEditor } from '../../../../../ImageBlockEditor'

export const IMAGE_BLOCK_UPDATE = gql`
  mutation ImageBlockUpdate(
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

export const IMAGE_BLOCK_DELETE = gql`
  mutation ImageBlockDelete($id: ID!, $parentBlockId: ID!, $journeyId: ID!) {
    blockDelete(id: $id, parentBlockId: $parentBlockId, journeyId: $journeyId) {
      id
      parentOrder
    }
  }
`

export function ImageOptions(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const [imageBlockUpdate, { loading }] =
    useMutation<ImageBlockUpdate>(IMAGE_BLOCK_UPDATE)

  const imageBlock = selectedBlock as TreeBlock<ImageBlock>

  const [blockDelete] = useMutation<ImageBlockDelete>(IMAGE_BLOCK_DELETE)

  const deleteCoverBlock = async (): Promise<void> => {
    if (journey == null) return

    await blockDelete({
      variables: {
        id: imageBlock.id,
        parentBlockId: imageBlock.parentBlockId,
        journeyId: journey.id
      },
      update(cache, { data }) {
        blockDeleteUpdate(imageBlock, data?.blockDelete, cache, journey.id)
      }
    })
  }

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

  const updateImageBlock = async (block: ImageBlock): Promise<void> => {
    if (journey == null) return

    try {
      await imageBlockUpdate({
        variables: {
          id: imageBlock.id,
          journeyId: journey.id,
          input: {
            src: block.src,
            alt: block.alt
          }
        }
      })
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
      onChange={updateImageBlock}
      selectedBlock={imageBlock}
      loading={loading}
    />
  )
}
