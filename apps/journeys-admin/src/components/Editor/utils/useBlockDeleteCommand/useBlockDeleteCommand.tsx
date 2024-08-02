import { useApolloClient } from '@apollo/client'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_CardBlock as CardBlock } from '../../../../../__generated__/BlockFields'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'
import { setBlockRestoreEditorState } from './setBlockRestoreEditorState'

export function useBlockDeleteCommand(): {
  addBlockDelete: (currentBlock: TreeBlock) => void
} {
  const { add } = useCommand()
  const {
    state: { selectedStep, steps },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const [blockDelete] = useBlockDeleteMutation()
  const [blockRestore] = useBlockRestoreMutation()

  function flatten(children: TreeBlock[]): TreeBlock[] {
    return children?.reduce<TreeBlock[]>((result, item) => {
      result.push(item)
      result.push(...flatten(item.children))
      return result
    }, [])
  }
  const client = useApolloClient()

  function addBlockDelete(currentBlock: TreeBlock): void {
    if (
      journey == null ||
      steps == null ||
      selectedStep == null ||
      currentBlock?.id == null
    )
      return

    const deletedBlockParentOrder = currentBlock.parentOrder
    const card = selectedStep?.children?.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    const cachedStepWithXandY =
      client.cache.extract()[`StepBlock:${selectedStep.id}`]
    const stepSiblingsBeforeDelete = steps.filter(
      (block) => block.id !== currentBlock.id
    )
    const canvasSiblingsBeforeDelete =
      card?.children.filter((block) => block.id !== currentBlock.id) ?? []
    const canvasSiblingsAfterDelete = canvasSiblingsBeforeDelete.map(
      (block, index) => ({
        ...block,
        parentOrder: block.parentOrder != null ? index : null
      })
    )
    add({
      parameters: {
        execute: {},
        undo: {}
      },
      execute() {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock:
            deletedBlockParentOrder != null
              ? canvasSiblingsAfterDelete.find(
                  ({ parentOrder }) => parentOrder === deletedBlockParentOrder
                )
              : undefined,
          selectedStep
        })
        void blockDelete(currentBlock, {
          optimisticResponse: { blockDelete: canvasSiblingsAfterDelete }
        })
      },
      undo() {
        const flattenedChildren = flatten(currentBlock?.children)
        setBlockRestoreEditorState(currentBlock, selectedStep, dispatch)
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
                    ...canvasSiblingsBeforeDelete
                  ]
                }
        })
      }
    })
  }

  return { addBlockDelete }
}
