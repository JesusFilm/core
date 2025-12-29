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
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
import {
  CoverImageBlockCreate,
  CoverImageBlockCreateVariables
} from '../../../../../../../../../../../__generated__/CoverImageBlockCreate'
import {
  CoverImageBlockUpdate,
  CoverImageBlockUpdateVariables
} from '../../../../../../../../../../../__generated__/CoverImageBlockUpdate'
import { ImageBlockUpdateInput } from '../../../../../../../../../../../__generated__/globalTypes'
import { blockDeleteUpdate } from '../../../../../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { blockRestoreUpdate } from '../../../../../../../../../../libs/useBlockRestoreMutation'
import { useCoverBlockDeleteMutation } from '../../../../../../../../../../libs/useCoverBlockDeleteMutation'
import { useCoverBlockRestoreMutation } from '../../../../../../../../../../libs/useCoverBlockRestoreMutation'
import { ImageSource } from '../../../../../../Drawer/ImageSource'

import { FocalPoint } from './FocalPoint'
import { ZoomImage } from './ZoomImage/ZoomImage'

export const COVER_IMAGE_BLOCK_CREATE = gql`
  ${IMAGE_FIELDS}
  mutation CoverImageBlockCreate(
    $id: ID!
    $input: ImageBlockCreateInput!
    $cardBlockId: ID!
  ) {
    imageBlockCreate(input: $input) {
      ...ImageFields
    }
    cardBlockUpdate(id: $cardBlockId, input: { coverBlockId: $id }) {
      id
      coverBlockId
    }
  }
`

export const COVER_IMAGE_BLOCK_UPDATE = gql`
  ${IMAGE_FIELDS}
  mutation CoverImageBlockUpdate($id: ID!, $input: ImageBlockUpdateInput!) {
    imageBlockUpdate(id: $id, input: $input) {
      ...ImageFields
    }
  }
`

interface BackgroundMediaImageProps {
  cardBlock?: TreeBlock<CardBlock>
}

export function BackgroundMediaImage({
  cardBlock
}: BackgroundMediaImageProps): ReactElement {
  const coverBlock = cardBlock?.children.find(
    (child) => child.id === cardBlock?.coverBlockId
  ) as TreeBlock<ImageBlock> | TreeBlock<VideoBlock> | undefined
  const { add } = useCommand()
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  const [createBlock] = useMutation<
    CoverImageBlockCreate,
    CoverImageBlockCreateVariables
  >(COVER_IMAGE_BLOCK_CREATE)
  const [updateBlock] = useMutation<
    CoverImageBlockUpdate,
    CoverImageBlockUpdateVariables
  >(COVER_IMAGE_BLOCK_UPDATE)
  const [deleteBlock] = useCoverBlockDeleteMutation()
  const [restoreBlock] = useCoverBlockRestoreMutation()

  function createImageBlock(input: ImageBlockUpdateInput): void {
    if (journey == null || cardBlock == null) return

    const block: ImageBlock = {
      id: uuidv4(),
      __typename: 'ImageBlock',
      parentBlockId: cardBlock.id,
      src: input.src ?? '',
      alt: input.alt ?? 'background media image',
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
          activeContent: ActiveContent.Canvas
        })
        void createBlock({
          variables: {
            id: block.id,
            cardBlockId: cardBlock.id,
            input: {
              journeyId: journey.id,
              isCover: true,
              id: block.id,
              ...input,
              alt: block.alt,
              parentBlockId: cardBlock.id
            }
          },
          optimisticResponse: {
            imageBlockCreate: block,
            cardBlockUpdate: {
              __typename: 'CardBlock',
              id: cardBlock.id,
              coverBlockId: block.id
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
          activeContent: ActiveContent.Canvas
        })
        void deleteBlock({
          variables: {
            id: block.id,
            cardBlockId: cardBlock.id
          },
          optimisticResponse: {
            blockDelete: [block],
            cardBlockUpdate: {
              id: cardBlock.id,
              coverBlockId: null,
              __typename: 'CardBlock'
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
        void restoreBlock({
          variables: {
            id: block.id,
            cardBlockId: cardBlock.id
          },
          optimisticResponse: {
            blockRestore: [block],
            cardBlockUpdate: {
              id: cardBlock.id,
              coverBlockId: block.id,
              __typename: 'CardBlock'
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
    if (
      journey == null ||
      coverBlock == null ||
      coverBlock.__typename === 'VideoBlock'
    )
      return

    const block: ImageBlock = {
      ...coverBlock,
      ...input,
      alt: input.alt ?? coverBlock.alt,
      blurhash: input.blurhash ?? coverBlock.blurhash,
      height: input.height ?? coverBlock.height,
      width: input.width ?? coverBlock.width,
      focalTop: input?.focalTop ?? coverBlock.focalTop,
      focalLeft: input?.focalLeft ?? coverBlock.focalLeft,
      scale: input?.scale ?? coverBlock.scale
    }

    add({
      parameters: {
        execute: block,
        undo: coverBlock
      },
      execute(block) {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas
        })
        void updateBlock({
          variables: {
            id: coverBlock.id,
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
    if (
      journey == null ||
      coverBlock == null ||
      coverBlock.__typename === 'VideoBlock' ||
      cardBlock == null
    )
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
          activeContent: ActiveContent.Canvas
        })
        void deleteBlock({
          variables: {
            id: coverBlock.id,
            cardBlockId: cardBlock.id
          },
          optimisticResponse: {
            blockDelete: [coverBlock],
            cardBlockUpdate: {
              id: cardBlock.id,
              coverBlockId: null,
              __typename: 'CardBlock'
            }
          },
          update(cache, { data }) {
            blockDeleteUpdate(coverBlock, data?.blockDelete, cache, journey.id)
          }
        })
      },
      undo() {
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas
        })
        void restoreBlock({
          variables: {
            id: coverBlock.id,
            cardBlockId: cardBlock.id
          },
          optimisticResponse: {
            blockRestore: [coverBlock],
            cardBlockUpdate: {
              id: cardBlock.id,
              coverBlockId: coverBlock.id,
              __typename: 'CardBlock'
            }
          },
          update(cache, { data }) {
            blockRestoreUpdate(
              coverBlock,
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

    if (coverBlock == null || coverBlock.__typename === 'VideoBlock') {
      await createImageBlock(input)
    } else {
      await updateImageBlock(input)
    }
  }

  return (
    <Stack gap={4}>
      <ImageSource
        selectedBlock={
          coverBlock?.__typename === 'ImageBlock' ? coverBlock : null
        }
        onChange={handleChange}
        onDelete={async () => deleteImageBlock()}
      />
      <FocalPoint
        imageBlock={coverBlock?.__typename === 'ImageBlock' ? coverBlock : null}
        updateImageBlock={updateImageBlock}
      />
      <ZoomImage
        imageBlock={coverBlock?.__typename === 'ImageBlock' ? coverBlock : null}
        updateImageBlock={updateImageBlock}
      />
    </Stack>
  )
}
