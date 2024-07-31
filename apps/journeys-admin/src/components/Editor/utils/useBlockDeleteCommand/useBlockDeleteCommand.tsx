import { useState } from 'react'

import { useApolloClient } from '@apollo/client'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_CardBlock as CardBlock } from '../../../../../__generated__/BlockFields'
import { blockDeleteUpdate } from '../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'
import getSelected from '../../Slider/Content/Canvas/QuickControls/DeleteBlock/utils/getSelected'
import { setBlockRestoreEditorState } from './setBlockRestoreEditorState'

export function useBlockDeleteCommand() {
  const [loading, setLoading] = useState(false)
  const { add } = useCommand()
  const {
    state: { selectedBlock, selectedStep, steps },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const [blockDelete] = useBlockDeleteMutation()

  const [blockRestore] = useBlockRestoreMutation()

  function flatten(children: TreeBlock[]): TreeBlock[] {
    return children.reduce<TreeBlock[]>(
      (result, item) => [...result, item, ...flatten(item.children)],
      []
    )
  }
  const client = useApolloClient()

  async function addBlockDelete(currentBlock: TreeBlock): Promise<void> {
    if (
      journey == null ||
      steps == null ||
      selectedStep == null ||
      currentBlock?.id == null
    ) {
      return
    }

    const deletedBlockParentOrder = currentBlock.parentOrder
    const deletedBlockType = currentBlock.__typename
    const stepsBeforeDelete = steps
    const stepBeforeDelete = selectedStep

    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    const cachedStepWithXandY =
      client.cache.extract()[`StepBlock:${selectedStep.id}`]
    const flattenedChildren = flatten(currentBlock.children)
    const stepSiblingsBeforeDelete = steps.filter(
      (block) => block.id !== currentBlock.id
    )
    const canvasSiblingsBeforeDelete = card?.children.filter(
      (block) => block.id !== currentBlock.id
    )

    try {
      setLoading(true)
      void add({
        parameters: {
          execute: {
            currentBlock: currentBlock,
            stepBeforeDelete,
            deletedBlockParentOrder,
            deletedBlockType,
            stepsBeforeDelete: stepsBeforeDelete,
            journeyId: journey.id
          },
          undo: {
            currentBlock: currentBlock,
            stepBeforeDelete,
            flattenedChildren
          }
        },
        async execute({
          currentBlock,
          stepBeforeDelete,
          deletedBlockParentOrder,
          deletedBlockType,
          stepsBeforeDelete,
          journeyId
        }) {
          setBlockRestoreEditorState(currentBlock, stepBeforeDelete, dispatch)
          void blockDelete(currentBlock, {
            optimisticResponse: { blockDelete: [currentBlock] },
            update(cache, { data }) {
              if (
                data?.blockDelete != null &&
                deletedBlockParentOrder != null &&
                (currentBlock == null || currentBlock?.id === selectedBlock?.id)
              ) {
                const selected = getSelected({
                  parentOrder: deletedBlockParentOrder,
                  siblings: data.blockDelete,
                  type: deletedBlockType,
                  steps: stepsBeforeDelete,
                  selectedStep: stepBeforeDelete
                })
                selected != null && dispatch(selected)
              }
              blockDeleteUpdate(
                currentBlock,
                data?.blockDelete,
                cache,
                journeyId
              )
            }
          })
        },
        async undo({ currentBlock, stepBeforeDelete, flattenedChildren }) {
          setBlockRestoreEditorState(currentBlock, stepBeforeDelete, dispatch)
          void blockRestore({
            variables: { id: currentBlock.id },
            optimisticResponse:
              currentBlock.__typename === 'StepBlock'
                ? {
                    blockRestore: [
                      { ...currentBlock, ...cachedStepWithXandY },
                      ...flattenedChildren,
                      ...stepSiblingsBeforeDelete
                    ]
                  }
                : {
                    blockRestore: [
                      currentBlock,
                      ...flattenedChildren,
                      ...(canvasSiblingsBeforeDelete ?? [])
                    ]
                  }
          })
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return { addBlockDelete, loading }
}
