import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import pick from 'lodash/pick'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../../__generated__/globalTypes'
import {
  ImageBlockUpdate,
  ImageBlockUpdateVariables
} from '../../../../../../../../../../__generated__/ImageBlockUpdate'
import { ImageSource } from '../../../../../Drawer/ImageSource'

export const IMAGE_BLOCK_UPDATE = gql`
  ${IMAGE_FIELDS}
  mutation ImageBlockUpdate(
    $id: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, input: $input) {
      id
      ...ImageFields
    }
  }
`

export function ImageOptions(): ReactElement {
  const [imageBlockUpdate] = useMutation<
    ImageBlockUpdate,
    ImageBlockUpdateVariables
  >(IMAGE_BLOCK_UPDATE)
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()
  const { add } = useCommand()

  const imageBlock = selectedBlock as TreeBlock<ImageBlock>

  async function deleteImageBlock(): Promise<void> {
    await updateImageBlock({ src: null, alt: '' })
  }

  async function updateImageBlock(input: ImageBlockUpdateInput): Promise<void> {
    const block: ImageBlock = {
      ...imageBlock,
      ...input,
      alt: input.alt ?? imageBlock.alt,
      blurhash: input.blurhash ?? imageBlock.blurhash,
      height: input.height ?? imageBlock.height,
      width: input.width ?? imageBlock.width
    }

    await add({
      parameters: {
        execute: block,
        undo: imageBlock
      },
      async execute(block) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep
        })
        await imageBlockUpdate({
          variables: {
            id: imageBlock.id,
            input: pick(block, Object.keys(input))
          },
          optimisticResponse: {
            imageBlockUpdate: block
          }
        })
      }
    })
  }

  return (
    <Box sx={{ px: 4, pb: 4 }}>
      <ImageSource
        selectedBlock={imageBlock}
        onChange={updateImageBlock}
        onDelete={deleteImageBlock}
      />
    </Box>
  )
}
