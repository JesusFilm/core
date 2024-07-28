import { gql, useMutation } from '@apollo/client'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import { ReactElement, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../__generated__/BlockFields'
import {
  PosterImageBlockCreate,
  PosterImageBlockCreateVariables
} from '../../../../../../../../../../__generated__/PosterImageBlockCreate'
import {
  PosterImageBlockDelete,
  PosterImageBlockDeleteVariables
} from '../../../../../../../../../../__generated__/PosterImageBlockDelete'
import {
  PosterImageBlockRestore,
  PosterImageBlockRestoreVariables
} from '../../../../../../../../../../__generated__/PosterImageBlockRestore'
import {
  PosterImageBlockUpdate,
  PosterImageBlockUpdateVariables
} from '../../../../../../../../../../__generated__/PosterImageBlockUpdate'
import { ImageBlockUpdateInput } from '../../../../../../../../../../__generated__/globalTypes'
import { blockDeleteUpdate } from '../../../../../../../../../libs/blockDeleteUpdate'
import { blockRestoreUpdate } from '../../../../../../../../../libs/useBlockRestoreMutation'
import { ImageLibrary } from '../../../../ImageLibrary'

export const POSTER_IMAGE_BLOCK_CREATE = gql`
  ${IMAGE_FIELDS}
  mutation PosterImageBlockCreate(
    $id: ID!
    $parentBlockId: ID!
    $input: ImageBlockCreateInput!
  ) {
    imageBlockCreate(input: $input) {
      ...ImageFields
    }
    videoBlockUpdate(id: $parentBlockId, input: { posterBlockId: $id }) {
      id
      posterBlockId
    }
  }
`

export const POSTER_IMAGE_BLOCK_UPDATE = gql`
  ${IMAGE_FIELDS}
  mutation PosterImageBlockUpdate(
    $id: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, input: $input) {
      ...ImageFields
    }
  }
`
export const POSTER_IMAGE_BLOCK_DELETE = gql`
  mutation PosterImageBlockDelete(
    $id: ID!
    $parentBlockId: ID!
  ) {
    blockDelete(id: $id, parentBlockId: $parentBlockId) {
      id
      parentOrder
    }
    videoBlockUpdate(id: $parentBlockId, input: { posterBlockId: null }) {
      id
      posterBlockId
    }
  }
`

export const POSTER_IMAGE_BLOCK_RESTORE = gql`
  ${IMAGE_FIELDS}
  mutation PosterImageBlockRestore(
    $id: ID!
    $videoBlockId: ID!
  ) {
    blockRestore(id: $id) {
      id
      ...on ImageBlock {
        ...ImageFields
      }
    }
    videoBlockUpdate(id: $videoBlockId, input: { posterBlockId: $id }) {
      id
      posterBlockId
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
  const { add } = useCommand()
  const { journey } = useJourney()

  const [createBlock, { loading: createLoading }] = useMutation<
    PosterImageBlockCreate,
    PosterImageBlockCreateVariables
  >(POSTER_IMAGE_BLOCK_CREATE)
  const [updateBlock, { loading: updateLoading }] = useMutation<
    PosterImageBlockUpdate,
    PosterImageBlockUpdateVariables
  >(POSTER_IMAGE_BLOCK_UPDATE)
  const [deleteBlock, { loading: deleteLoading }] = useMutation<
    PosterImageBlockDelete,
    PosterImageBlockDeleteVariables
  >(POSTER_IMAGE_BLOCK_DELETE)
  const [restoreBlock, { loading: restoreLoading }] = useMutation<
    PosterImageBlockRestore,
    PosterImageBlockRestoreVariables
  >(POSTER_IMAGE_BLOCK_RESTORE)

  useEffect(() => {
    if (createLoading || updateLoading || deleteLoading || restoreLoading) {
      onLoading?.()
    } else {
      onLoad?.()
    }
  }, [
    createLoading,
    updateLoading,
    deleteLoading,
    restoreLoading,
    onLoading,
    onLoad
  ])

  async function createImageBlock(input: ImageBlockUpdateInput): Promise<void> {
    if (parentBlockId == null || journey == null) return

    const block: ImageBlock = {
      id: uuidv4(),
      __typename: 'ImageBlock',
      parentBlockId,
      src: input.src ?? '',
      alt: input.alt ?? 'poster image',
      width: input.width ?? 0,
      height: input.height ?? 0,
      blurhash: input.blurhash ?? '',
      parentOrder: 0
    }

    await add({
      parameters: {
        execute: {
          block
        },
        undo: {
          block
        },
        redo: {
          block
        }
      },
      async execute({ block }) {
        await createBlock({
          variables: {
            id: block.id,
            parentBlockId,
            input: {
              journeyId: journey.id,
              ...omit(block, '__typename', 'parentOrder')
            }
          },
          optimisticResponse: {
            imageBlockCreate: block,
            videoBlockUpdate: {
              id: parentBlockId,
              posterBlockId: block.id,
              __typename: 'VideoBlock'
            }
          },
          update(cache, { data }) {
            if (data?.imageBlockCreate == null) return
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
        })
      },
      async undo({ block }) {
        await deleteBlock({
          variables: {
            id: block.id,
            parentBlockId
          },
          optimisticResponse: {
            blockDelete: [block],
            videoBlockUpdate: {
              id: parentBlockId,
              posterBlockId: null,
              __typename: 'VideoBlock'
            }
          },
          update(cache, { data }) {
            blockDeleteUpdate(block, data?.blockDelete, cache, journey.id)
          }
        })
      },
      async redo({ block }) {
        await restoreBlock({
          variables: {
            id: block.id,
            videoBlockId: parentBlockId
          },
          optimisticResponse: {
            blockRestore: [block],
            videoBlockUpdate: {
              id: parentBlockId,
              posterBlockId: block.id,
              __typename: 'VideoBlock'
            }
          },
          update(cache, { data }) {
            blockRestoreUpdate(block, data?.blockRestore, cache, journey.id)
          }
        })
      }
    })
  }

  async function updateImageBlock(input: ImageBlockUpdateInput): Promise<void> {
    if (selectedBlock == null || journey == null) return

    const block: ImageBlock = {
      ...selectedBlock,
      ...input,
      alt: input.alt ?? selectedBlock.alt,
      blurhash: input.blurhash ?? selectedBlock.blurhash,
      height: input.height ?? selectedBlock.height,
      width: input.width ?? selectedBlock.width
    }

    await add({
      parameters: {
        execute: block,
        undo: selectedBlock
      },
      async execute(block) {
        await updateBlock({
          variables: {
            id: selectedBlock.id,
            input: pick(block, Object.keys(input))
          },
          optimisticResponse: {
            imageBlockUpdate: block
          }
        })
      }
    })
  }

  async function deleteImageBlock(): Promise<void> {
    if (selectedBlock == null || parentBlockId == null || journey == null)
      return

    await add({
      parameters: {
        execute: { selectedBlock, parentBlockId, journeyId: journey.id },
        undo: { selectedBlock, parentBlockId }
      },
      async execute({ selectedBlock, parentBlockId, journeyId }) {
        await deleteBlock({
          variables: {
            id: selectedBlock.id,
            parentBlockId
          },
          optimisticResponse: {
            blockDelete: [selectedBlock],
            videoBlockUpdate: {
              id: parentBlockId,
              posterBlockId: null,
              __typename: 'VideoBlock'
            }
          },
          update(cache, { data }) {
            blockDeleteUpdate(
              selectedBlock,
              data?.blockDelete,
              cache,
              journeyId
            )
          }
        })
      },
      async undo({ selectedBlock, parentBlockId }) {
        await restoreBlock({
          variables: {
            id: selectedBlock.id,
            videoBlockId: parentBlockId
          },
          optimisticResponse: {
            blockRestore: [selectedBlock],
            videoBlockUpdate: {
              id: parentBlockId,
              posterBlockId: selectedBlock.id,
              __typename: 'VideoBlock'
            }
          },
          update(cache, { data }) {
            blockRestoreUpdate(
              selectedBlock,
              data?.blockRestore,
              cache,
              journey.id
            )
          }
        })
      }
    })
  }

  async function handleChange(block: ImageBlock): Promise<void> {
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
          onDelete={deleteImageBlock}
          selectedBlock={selectedBlock}
        />
      )}
    </>
  )
}
