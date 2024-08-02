import { useApolloClient } from '@apollo/client'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_CardBlock as CardBlock } from '../../../../../__generated__/BlockFields'
import { blockDeleteUpdate } from '../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'
import { setBlockRestoreEditorState } from './setBlockRestoreEditorState'

export function useBlockDeleteCommand(): {
  addBlockDelete: (currentBlock: TreeBlock) => void
} {
  const { add } = useCommand()
  const {
    state: { selectedBlock, selectedStep, steps },
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
    const deletedBlockType = currentBlock.__typename
    const stepsBeforeDelete = steps
    const stepBeforeDelete = selectedStep

    const card = selectedStep?.children?.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    const cachedStepWithXandY =
      client.cache.extract()[`StepBlock:${selectedStep.id}`]
    const flattenedChildren = flatten(currentBlock?.children)
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
      execute({
        currentBlock,
        stepBeforeDelete,
        deletedBlockParentOrder,
        deletedBlockType,
        stepsBeforeDelete,
        journeyId
      }) {
        // if (
        //   deletedBlockParentOrder != null &&
        //   (currentBlock == null || currentBlock?.id === selectedBlock?.id)
        // ) {
        //   const selected = getSelected({
        //     parentOrder: deletedBlockParentOrder,
        //     siblings:
        //       currentBlock.__typename === 'StepBlock'
        //         ? stepSiblingsBeforeDelete
        //         : canvasSiblingsBeforeDelete ?? [],
        //     type: deletedBlockType,
        //     steps: stepsBeforeDelete,
        //     selectedStep: stepBeforeDelete
        //   })
        //   selected != null && dispatch(selected)
        // }
        console.log(canvasSiblingsAfterDelete[deletedBlockParentOrder])

        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlockId:
            canvasSiblingsAfterDelete[deletedBlockParentOrder]?.id,
          selectedStepId: selectedStep.id
        })
        void blockDelete(currentBlock, {
          optimisticResponse: { blockDelete: canvasSiblingsAfterDelete },
          update(cache, { data }) {
            blockDeleteUpdate(currentBlock, data?.blockDelete, cache, journeyId)
          }
        })
      },
      undo({ currentBlock, stepBeforeDelete, flattenedChildren }) {
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
                    ...canvasSiblingsBeforeDelete
                  ]
                }
        })
      }
    })
  }

  return { addBlockDelete }
}
