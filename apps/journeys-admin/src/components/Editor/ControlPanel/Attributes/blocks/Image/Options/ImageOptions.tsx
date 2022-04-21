import { ReactElement, useState, useEffect } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { useSnackbar } from 'notistack'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'
import { ImageBlockEditor } from '../../../../../ImageBlockEditor'
import { useJourney } from '../../../../../../../libs/context'
import { ImageBlockUpdate } from '../../../../../../../../__generated__/ImageBlockUpdate'

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
  const journey = useJourney()
  const { enqueueSnackbar } = useSnackbar()
  const [imageBlockUpdate, { loading: updateLoading }] =
    useMutation<ImageBlockUpdate>(IMAGE_BLOCK_UPDATE)
  const imageBlock = selectedBlock as TreeBlock<ImageBlock>

  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (updateLoading) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [updateLoading])

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
    <Box sx={{ pt: 4, pb: 3, px: 6 }}>
      <ImageBlockEditor
        selectedBlock={imageBlock}
        onChange={updateImageBlock}
        showDelete={false}
        loading={loading}
      />
    </Box>
  )
}
