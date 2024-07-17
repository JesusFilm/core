import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import getSelected from '../../components/Editor/Slider/Content/Canvas/QuickControls/DeleteBlock/utils/getSelected'
import { blockDeleteUpdate } from '../blockDeleteUpdate'
import { useBlockDeleteMutation } from '../useBlockDeleteMutation'
import {
  setBlockRestoreEditorState,
  useBlockRestoreMutation
} from '../useBlockRestoreMutation'

export function useBlockDeleteCommand() {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation('apps-journeys-admin')
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
            currentBlock: currentBlock,
            stepBeforeDelete: stepBeforeDelete,
            deletedBlockParentOrder,
            deletedBlockType,
            stepsBeforeDelete: stepsBeforeDelete,
            journeyId: journey.id
          },
          undo: {
            currentBlock: currentBlock,
            stepBeforeDelete: stepBeforeDelete
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
          dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
        },
        async undo({ currentBlock, stepBeforeDelete }) {
          await blockRestore({
            variables: { blockRestoreId: currentBlock.id }
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
