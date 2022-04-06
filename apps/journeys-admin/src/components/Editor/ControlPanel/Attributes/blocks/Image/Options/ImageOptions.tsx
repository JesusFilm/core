import { ReactElement } from 'react'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'

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
  const { id: journeyId } = useJourney()
  const [imageBlockUpdate] = useMutation<ImageBlockUpdate>(IMAGE_BLOCK_UPDATE)
  const imageBlock = selectedBlock as TreeBlock<ImageBlock>

  const updateImageBlock = async (block: ImageBlock): Promise<void> => {
    await imageBlockUpdate({
      variables: {
        id: imageBlock.id,
        journeyId: journeyId,
        input: {
          src: block.src,
          alt: block.alt
        }
      }
    })
  }

  return (
    <Box sx={{ py: 3, px: 6 }}>
      <ImageBlockEditor
        selectedBlock={imageBlock}
        onChange={updateImageBlock}
        showDelete={false}
      />
    </Box>
  )
}
