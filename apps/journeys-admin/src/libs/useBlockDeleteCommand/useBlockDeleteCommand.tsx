import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import cloneDeep from 'lodash/cloneDeep'
import { useSnackbar } from 'notistack'
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
  const { enqueueSnackbar } = useSnackbar()
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
      currentBlock == null
    ) {
      enqueueSnackbar(
        t('Delete operation failed, please reload and try again'),
        {
          variant: 'error',
          preventDuplicate: true
        }
      )
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
          execute: { currentBlock: cloneDeep(currentBlock) },
          undo: {}
        },
        async execute() {
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
                journey.id
              )
            }
          })
          dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
        },
        async undo() {
          await blockRestore({
            variables: { blockRestoreId: currentBlock?.id }
          })
          setBlockRestoreEditorState(currentBlock, stepBeforeDelete, dispatch)
        }
      })
      currentBlock.__typename !== 'StepBlock'
        ? enqueueSnackbar(t('Block Deleted'), {
            variant: 'success',
            preventDuplicate: true
          })
        : enqueueSnackbar(t('Card Deleted'), {
            variant: 'success',
            preventDuplicate: true
          })
    } finally {
      setLoading(false)
    }
  }

  return { addBlockDelete, loading }
}
