import { useApolloClient } from '@apollo/client'

import { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import {
  ActiveContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_CardBlock as CardBlock } from '../../../../../__generated__/BlockFields'
import { blockDeleteUpdate } from '../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../libs/useBlockDeleteMutation'
import { useBlockRestoreMutation } from '../../../../libs/useBlockRestoreMutation'
import { useJourneyUpdateMutation } from '../../../../libs/useJourneyUpdateMutation'

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
  const [journeyUpdate] = useJourneyUpdateMutation()

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
    const stepSiblingsAfterDelete = stepSiblingsBeforeDelete.map(
      (block, index) => ({
        ...block,
        parentOrder: block.parentOrder != null ? index : null
      })
    )
    const canvasSiblingsBeforeDelete =
      card?.children.filter((block) => block.id !== currentBlock.id) ?? []
    const canvasSiblingsAfterDelete = canvasSiblingsBeforeDelete.map(
      (block, index) => ({
        ...block,
        parentOrder: block.parentOrder != null ? index : null
      })
    )

    const isMenuBlock =
      currentBlock.id === journey.menuStepBlock?.id &&
      currentBlock.__typename === 'StepBlock'

    add({
      parameters: {
        execute: {},
        undo: {}
      },
      execute() {
        const nextSelectedStep =
          stepSiblingsAfterDelete.find(
            ({ parentOrder }) => parentOrder === deletedBlockParentOrder
          ) ??
          stepSiblingsAfterDelete.find(({ parentOrder }) => {
            return deletedBlockParentOrder != null
              ? parentOrder === deletedBlockParentOrder - 1
              : null
          })
        currentBlock.__typename === 'StepBlock'
          ? dispatch({
              type: 'SetEditorFocusAction',
              selectedStep: nextSelectedStep,
              selectedBlock: nextSelectedStep,
              activeSlide: ActiveSlide.JourneyFlow,
              activeContent: ActiveContent.Canvas
            })
          : dispatch({
              type: 'SetEditorFocusAction',
              selectedBlock:
                deletedBlockParentOrder != null
                  ? canvasSiblingsAfterDelete.find(
                      ({ parentOrder }) =>
                        parentOrder === deletedBlockParentOrder - 1
                    )
                  : undefined,
              selectedStep,
              activeContent: ActiveContent.Canvas,
              activeSlide: ActiveSlide.Content
            })

        void blockDelete(currentBlock, {
          optimisticResponse: { blockDelete: canvasSiblingsAfterDelete },
          update(cache, { data }) {
            blockDeleteUpdate(
              currentBlock,
              data?.blockDelete,
              cache,
              journey.id
            )
          }
        })

        if (isMenuBlock) {
          void journeyUpdate({
            variables: {
              id: journey.id,
              input: {
                menuStepBlockId: null
              }
            },
            optimisticResponse: {
              journeyUpdate: {
                ...journey,
                menuStepBlock: null
              }
            }
          })
        }
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

        if (isMenuBlock)
          void journeyUpdate({
            variables: {
              id: journey.id,
              input: {
                menuStepBlockId: currentBlock.id
              }
            },
            optimisticResponse: {
              journeyUpdate: {
                ...journey,
                menuStepBlock: currentBlock
              }
            }
          })
      }
    })
  }

  return { addBlockDelete }
}
