import { gql, useMutation } from '@apollo/client'
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
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../../__generated__/BlockFields'
import {
  CoverVideoBlockCreate,
  CoverVideoBlockCreateVariables
} from '../../../../../../../../../../../__generated__/CoverVideoBlockCreate'
import {
  CoverVideoBlockUpdate,
  CoverVideoBlockUpdateVariables
} from '../../../../../../../../../../../__generated__/CoverVideoBlockUpdate'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../../../../../../__generated__/globalTypes'
import { blockDeleteUpdate } from '../../../../../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { blockRestoreUpdate } from '../../../../../../../../../../libs/useBlockRestoreMutation'
import { useCoverBlockDeleteMutation } from '../../../../../../../../../../libs/useCoverBlockDeleteMutation'
import { useCoverBlockRestoreMutation } from '../../../../../../../../../../libs/useCoverBlockRestoreMutation'
import { VideoBlockEditor } from '../../../../../../Drawer/VideoBlockEditor'

export const COVER_VIDEO_BLOCK_CREATE = gql`
  ${VIDEO_FIELDS}
  mutation CoverVideoBlockCreate(
    $id: ID!
    $input: VideoBlockCreateInput!
    $cardBlockId: ID!
  ) {
    videoBlockCreate(input: $input) {
      ...VideoFields
    }
    cardBlockUpdate(id: $cardBlockId, input: { coverBlockId: $id }) {
      id
      coverBlockId
    }
  }
`

export const COVER_VIDEO_BLOCK_UPDATE = gql`
  ${VIDEO_FIELDS}
  mutation CoverVideoBlockUpdate($id: ID!, $input: VideoBlockUpdateInput!) {
    videoBlockUpdate(id: $id, input: $input) {
      ...VideoFields
    }
  }
`

interface BackgroundMediaVideoProps {
  cardBlock?: TreeBlock<CardBlock>
}

export function BackgroundMediaVideo({
  cardBlock
}: BackgroundMediaVideoProps): ReactElement {
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
    CoverVideoBlockCreate,
    CoverVideoBlockCreateVariables
  >(COVER_VIDEO_BLOCK_CREATE)
  const [updateBlock] = useMutation<
    CoverVideoBlockUpdate,
    CoverVideoBlockUpdateVariables
  >(COVER_VIDEO_BLOCK_UPDATE)
  const [deleteBlock] = useCoverBlockDeleteMutation()
  const [restoreBlock] = useCoverBlockRestoreMutation()

  function createVideoBlock(
    input: VideoBlockUpdateInput,
    shouldFocus = true
  ): void {
    if (journey == null || cardBlock == null) return

    let typename
    switch (input.source) {
      case VideoBlockSource.youTube:
        typename = 'YouTube'
        break
      case VideoBlockSource.mux:
        typename = 'Mux'
        break
      default:
        typename = 'Internal'
        break
    }
    const block: VideoBlock = {
      id: uuidv4(),
      __typename: 'VideoBlock',
      parentBlockId: cardBlock.id,
      parentOrder: null,
      title: null,
      description: null,
      image: null,
      mediaVideo:
        input.videoId != null
          ? {
              id: input.videoId ?? null,
              __typename: typename
            }
          : null,
      action: null,
      startAt: input.startAt ?? null,
      endAt: input.endAt ?? null,
      muted: input.muted ?? null,
      autoplay: input.autoplay ?? null,
      duration: input.duration ?? null,
      videoId: input.videoId ?? null,
      videoVariantLanguageId: input.videoVariantLanguageId ?? null,
      source: input.source ?? VideoBlockSource.internal,
      posterBlockId: input.posterBlockId ?? null,
      fullsize: input.fullsize ?? null,
      objectFit: input.objectFit ?? null,
      subtitleLanguage:
        input.subtitleLanguageId != null
          ? {
              __typename: 'Language',
              id: input.subtitleLanguageId,
              bcp47: ''
            }
          : null,
      showGeneratedSubtitles: null,
      eventLabel: null,
      endEventLabel: null,
      customizable: null,
      notes: null
    }

    add({
      parameters: {
        execute: {},
        undo: {}
      },
      execute() {
        // Skip the canvas refocus when the change originates from the secondary
        // video drawer, so the card does not shift behind the drawer.
        if (shouldFocus)
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
              parentBlockId: cardBlock.id
            }
          },
          optimisticResponse: {
            videoBlockCreate: block,
            cardBlockUpdate: {
              __typename: 'CardBlock',
              id: cardBlock.id,
              coverBlockId: block.id
            }
          },
          update(cache, { data }) {
            if (data?.videoBlockCreate != null) {
              cache.modify({
                id: cache.identify({ __typename: 'Journey', id: journey.id }),
                fields: {
                  blocks(existingBlockRefs = []) {
                    const newBlockRef = cache.writeFragment({
                      data: data.videoBlockCreate,
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
            blockDeleteUpdate(cache, journey.id, block, data?.blockDelete)
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

  function updateVideoBlock(
    input: VideoBlockUpdateInput,
    shouldFocus = true
  ): void {
    if (
      journey == null ||
      coverBlock == null ||
      coverBlock.__typename === 'ImageBlock'
    )
      return

    const block: VideoBlock = {
      ...coverBlock,
      ...input,
      source: input.source ?? coverBlock.source
    }

    // A live select from the secondary video drawer skips the canvas refocus so
    // the card does not shift behind the drawer; undo/redo always refocus to
    // show the change, matching the rest of the editor.
    function update(block: VideoBlock, focus: boolean): void {
      if (focus)
        dispatch({
          type: 'SetEditorFocusAction',
          activeSlide: ActiveSlide.Content,
          selectedStep,
          activeContent: ActiveContent.Canvas
        })
      void updateBlock({
        variables: {
          id: block.id,
          input: pick(block, Object.keys(input))
        },
        optimisticResponse: {
          videoBlockUpdate: block
        }
      })
    }

    add({
      parameters: {
        execute: block,
        undo: coverBlock
      },
      execute: (block) => update(block, shouldFocus),
      undo: (block) => update(block, true),
      redo: (block) => update(block, true)
    })
  }

  function deleteVideoBlock(): void {
    if (
      journey == null ||
      coverBlock == null ||
      coverBlock.__typename === 'ImageBlock' ||
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
            blockDeleteUpdate(cache, journey.id, coverBlock, data?.blockDelete)
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

  async function handleChange(
    input: VideoBlockUpdateInput,
    shouldFocus = true
  ): Promise<void> {
    if (input.videoId === null) {
      await deleteVideoBlock()
    } else if (coverBlock == null) {
      await createVideoBlock(input, shouldFocus)
    } else {
      await updateVideoBlock(input, shouldFocus)
    }
  }

  const videoCoverBlock =
    coverBlock?.__typename === 'VideoBlock' ? coverBlock : null

  return (
    <VideoBlockEditor selectedBlock={videoCoverBlock} onChange={handleChange} />
  )
}
