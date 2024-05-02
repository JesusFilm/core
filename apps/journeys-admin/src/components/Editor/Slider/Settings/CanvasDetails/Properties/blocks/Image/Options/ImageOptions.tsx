import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdate } from '../../../../../../../../../../__generated__/ImageBlockUpdate'
import { ImageSource } from '../../../../../Drawer/ImageSource'

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

export function ImageOptions(): ReactElement {
  const {
    state: { selectedBlock }
  } = useEditor()
  const { journey } = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const [imageBlockUpdate, { loading, error }] =
    useMutation<ImageBlockUpdate>(IMAGE_BLOCK_UPDATE)

  const imageBlock = selectedBlock as TreeBlock<ImageBlock>

  const handleImageDelete = async (): Promise<void> => {
    if (journey == null) return

    try {
      await imageBlockUpdate({
        variables: {
          id: imageBlock.id,
          journeyId: journey.id,
          input: {
            src: null,
            alt: ''
          }
        }
      })
    } catch (e) {
      if (e instanceof Error) {
        enqueueSnackbar(e.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
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
    } catch (e) {
      if (e instanceof Error) {
        enqueueSnackbar(e.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }

  return (
    <Box sx={{ px: 4, pb: 4 }}>
      <ImageSource
        selectedBlock={imageBlock}
        onChange={updateImageBlock}
        onDelete={handleImageDelete}
        loading={loading}
        error={error != null}
      />
    </Box>
  )
}
