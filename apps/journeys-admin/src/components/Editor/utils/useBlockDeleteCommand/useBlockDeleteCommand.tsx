import { useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { blockDeleteUpdate } from '../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'
import getSelected from '../../Slider/Content/Canvas/QuickControls/DeleteBlock/utils/getSelected'

import { setBlockRestoreEditorState } from './setBlockRestoreEditorState'

export function useBlockDeleteCommand(): {
  addBlockDelete: (currentBlock: TreeBlock) => Promise<void>
  loading: boolean
} {
  const [loading, setLoading] = useState(false)
  const { add } = useCommand()
  const {
    state: { selectedBlock, selectedStep, steps },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const [blockDelete] = useBlockDeleteMutation()

  const [blockRestore] = useBlockRestoreMutation()

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
    try {
      setLoading(true)
      await add({
        parameters: {
          execute: {
            currentBlock,
            stepBeforeDelete,
            deletedBlockParentOrder,
            deletedBlockType,
            stepsBeforeDelete,
            journeyId: journey.id
          },
          undo: {
            currentBlock,
            stepBeforeDelete
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
          await blockDelete(currentBlock, {
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
        async undo({ currentBlock, stepBeforeDelete }) {
          await blockRestore({
            variables: { id: currentBlock.id }
          })
          setBlockRestoreEditorState(currentBlock, stepBeforeDelete, dispatch)
        }
      })
    } finally {
      setLoading(false)
    }
  }

  return { addBlockDelete, loading }
}
