import { gql, useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import pick from 'lodash/pick'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../../__generated__/globalTypes'
import {
  RadioOptionImageCreate,
  RadioOptionImageCreateVariables
} from '../../../../../../../../../../__generated__/RadioOptionImageCreate'
import {
  RadioOptionImageDelete,
  RadioOptionImageDeleteVariables
} from '../../../../../../../../../../__generated__/RadioOptionImageDelete'
import {
  RadioOptionImageRestore,
  RadioOptionImageRestoreVariables
} from '../../../../../../../../../../__generated__/RadioOptionImageRestore'
import {
  RadioOptionImageUpdate,
  RadioOptionImageUpdateVariables
} from '../../../../../../../../../../__generated__/RadioOptionImageUpdate'
// import { blockDeleteUpdate } from '../../../../../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
// import { blockRestoreUpdate } from '../../../../../../../../../../libs/useBlockRestoreMutation'
import { blockDeleteUpdate } from '../../../../../../../../../libs/blockDeleteUpdate'
import { blockRestoreUpdate } from '../../../../../../../../../libs/useBlockRestoreMutation'
import { ImageSource } from '../../../../../Drawer/ImageSource'
import { FocalPoint } from '../../Card/BackgroundMedia/Image/FocalPoint'
import { ZoomImage } from '../../Card/BackgroundMedia/Image/ZoomImage'

export const RADIO_OPTION_IMAGE_CREATE = gql`
  ${IMAGE_FIELDS}
  mutation RadioOptionImageCreate(
    $id: ID!
    $input: ImageBlockCreateInput!
    $radioOptionBlockId: ID!
  ) {
    imageBlockCreate(input: $input) {
      ...ImageFields
    }
    radioOptionBlockUpdate(
      id: $radioOptionBlockId
      input: { pollOptionImageId: $id }
    ) {
      id
      pollOptionImageId
    }
  }
`

export const RADIO_OPTION_IMAGE_UPDATE = gql`
  ${IMAGE_FIELDS}
  mutation RadioOptionImageUpdate($id: ID!, $input: ImageBlockUpdateInput!) {
    imageBlockUpdate(id: $id, input: $input) {
      ...ImageFields
    }
  }
`

export const RADIO_OPTION_IMAGE_DELETE = gql`
  mutation RadioOptionImageDelete($id: ID!, $radioOptionBlockId: ID!) {
    blockDelete(id: $id) {
      id
      parentOrder
    }
    radioOptionBlockUpdate(
      id: $radioOptionBlockId
      input: { pollOptionImageId: null }
    ) {
      id
      pollOptionImageId
    }
  }
`

export const RADIO_OPTION_IMAGE_RESTORE = gql`
  ${IMAGE_FIELDS}
  mutation RadioOptionImageRestore($id: ID!, $radioOptionBlockId: ID!) {
    blockRestore(id: $id) {
      id
      ... on ImageBlock {
        ...ImageFields
      }
    }
    radioOptionBlockUpdate(
      id: $radioOptionBlockId
      input: { pollOptionImageId: $id }
    ) {
      id
      pollOptionImageId
    }
  }
`

export function RadioOptionImage({
  radioOptionBlock
}: {
  radioOptionBlock: TreeBlock<RadioOptionBlock>
}): ReactElement {
  const imageBlock = radioOptionBlock.children.find(
    (child) => child.id === radioOptionBlock.pollOptionImageId
  ) as TreeBlock<ImageBlock> | undefined

  const { add } = useCommand()
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  const [radioOptionImageCreate] = useMutation<
    RadioOptionImageCreate,
    RadioOptionImageCreateVariables
  >(RADIO_OPTION_IMAGE_CREATE)
  const [radioOptionImageUpdate] = useMutation<
    RadioOptionImageUpdate,
    RadioOptionImageUpdateVariables
  >(RADIO_OPTION_IMAGE_UPDATE)
  const [radioOptionImageDelete] = useMutation<
    RadioOptionImageDelete,
    RadioOptionImageDeleteVariables
  >(RADIO_OPTION_IMAGE_DELETE)
  const [restoreImageBlock] = useMutation<
    RadioOptionImageRestore,
    RadioOptionImageRestoreVariables
  >(RADIO_OPTION_IMAGE_RESTORE)

  function createImageBlock(input: ImageBlockUpdateInput): void {
    if (journey == null || radioOptionBlock == null) return

    const block: ImageBlock = {
      id: uuidv4(),
      __typename: 'ImageBlock',
      parentBlockId: radioOptionBlock.id,
      src: input.src ?? '',
      alt: input.alt ?? 'radio option image',
      width: input.width ?? 0,
      height: input.height ?? 0,
      blurhash: input.blurhash ?? '',
      parentOrder: null,
      scale: 100,
      focalTop: 50,
      focalLeft: 50
    }

    add({
      parameters: {
        execute: {},
        undo: {}
      },
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas,
          selectedBlock: radioOptionBlock,
          selectedBlockId: radioOptionBlock.id
        })
        void radioOptionImageCreate({
          variables: {
            id: block.id,
            radioOptionBlockId: radioOptionBlock.id,
            input: {
              journeyId: journey.id,
              id: block.id,
              ...input,
              alt: block.alt,
              parentBlockId: radioOptionBlock.id
            }
          },
          optimisticResponse: {
            imageBlockCreate: block,
            radioOptionBlockUpdate: {
              __typename: 'RadioOptionBlock',
              id: radioOptionBlock.id,
              pollOptionImageId: block.id
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
      },
      undo() {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas,
          selectedBlock: radioOptionBlock,
          selectedBlockId: radioOptionBlock.id
        })
        void radioOptionImageDelete({
          variables: {
            id: block.id,
            radioOptionBlockId: radioOptionBlock.id
          },
          optimisticResponse: {
            blockDelete: [block],
            radioOptionBlockUpdate: {
              id: radioOptionBlock.id,
              pollOptionImageId: null,
              __typename: 'RadioOptionBlock'
            }
          },
          update(cache, { data }) {
            blockDeleteUpdate(block, data?.blockDelete, cache, journey.id)
          }
        })
      },
      redo() {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas
        })
        void restoreImageBlock({
          variables: {
            id: block.id,
            radioOptionBlockId: radioOptionBlock.id
          },
          optimisticResponse: {
            blockRestore: [block],
            radioOptionBlockUpdate: {
              id: radioOptionBlock.id,
              pollOptionImageId: block.id,
              __typename: 'RadioOptionBlock'
            }
          },
          update(cache, { data }) {
            blockRestoreUpdate(block, data?.blockRestore, cache, journey.id)
          }
        })
      }
    })
  }

  function updateImageBlock(input: ImageBlockUpdateInput): void {
    if (journey == null || imageBlock == null) return

    const block: ImageBlock = {
      ...imageBlock,
      ...input,
      alt: input.alt ?? imageBlock.alt,
      blurhash: input.blurhash ?? imageBlock.blurhash,
      height: input.height ?? imageBlock.height,
      width: input.width ?? imageBlock.width,
      focalTop: input?.focalTop ?? imageBlock.focalTop,
      focalLeft: input?.focalLeft ?? imageBlock.focalLeft,
      scale: input?.scale ?? imageBlock.scale
    }

    add({
      parameters: {
        execute: block,
        undo: imageBlock
      },
      execute(block) {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas,
          selectedBlock: radioOptionBlock,
          selectedBlockId: radioOptionBlock.id
        })
        void radioOptionImageUpdate({
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

  function deleteImageBlock(): void {
    if (journey == null || imageBlock == null || radioOptionBlock == null)
      return

    add({
      parameters: {
        execute: {},
        undo: {}
      },
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas,
          selectedBlock: radioOptionBlock,
          selectedBlockId: radioOptionBlock.id
        })
        void radioOptionImageDelete({
          variables: {
            id: imageBlock.id,
            radioOptionBlockId: radioOptionBlock.id
          },
          optimisticResponse: {
            blockDelete: [imageBlock],
            radioOptionBlockUpdate: {
              id: radioOptionBlock.id,
              pollOptionImageId: null,
              __typename: 'RadioOptionBlock'
            }
          },
          update(cache, { data }) {
            blockDeleteUpdate(imageBlock, data?.blockDelete, cache, journey.id)
          }
        })
      },
      undo() {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas,
          selectedBlock: radioOptionBlock,
          selectedBlockId: radioOptionBlock.id
        })
        void restoreImageBlock({
          variables: {
            id: imageBlock.id,
            radioOptionBlockId: radioOptionBlock.id
          },
          optimisticResponse: {
            blockRestore: [imageBlock],
            radioOptionBlockUpdate: {
              id: radioOptionBlock.id,
              pollOptionImageId: imageBlock.id,
              __typename: 'RadioOptionBlock'
            }
          },
          update(cache, { data }) {
            blockRestoreUpdate(
              imageBlock,
              data?.blockRestore,
              cache,
              journey.id
            )
          }
        })
      }
    })
  }

  async function handleChange(input: ImageBlockUpdateInput): Promise<void> {
    if (input.src === '') return

    if (imageBlock == null) {
      await createImageBlock(input)
    } else {
      await updateImageBlock(input)
    }
  }

  return (
    <Stack gap={4} sx={{ px: 4 }}>
      <ImageSource
        selectedBlock={
          imageBlock?.__typename === 'ImageBlock' ? imageBlock : null
        }
        onChange={handleChange}
        onDelete={async () => deleteImageBlock()}
      />
      <FocalPoint
        imageBlock={imageBlock?.__typename === 'ImageBlock' ? imageBlock : null}
        updateImageBlock={updateImageBlock}
      />
      <ZoomImage
        imageBlock={imageBlock?.__typename === 'ImageBlock' ? imageBlock : null}
        updateImageBlock={updateImageBlock}
      />
    </Stack>
  )
}
