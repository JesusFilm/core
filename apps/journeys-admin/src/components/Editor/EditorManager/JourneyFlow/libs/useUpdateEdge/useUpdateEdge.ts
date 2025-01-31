import get from 'lodash/get'
import { Edge } from 'reactflow'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import {
  getNewParentOrder,
  useBlockOrderUpdateMutation
} from '../../../../../../libs/useBlockOrderUpdateMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'
import { useActionCommand } from '../../../../utils/useActionCommand'
import { RawEdgeSource, convertToEdgeSource } from '../convertToEdgeSource'
import { useDeleteEdge } from '../useDeleteEdge'

type RawEdgeSourceAndTarget = RawEdgeSource & { target?: string | null } & {
  oldEdge?: Edge
}

export function useUpdateEdge(): (
  rawEdgeSource: RawEdgeSourceAndTarget
) => void {
  const {
    state: { steps },
    dispatch
  } = useEditor()

  const [blockOrderUpdate] = useBlockOrderUpdateMutation()
  const { addAction } = useActionCommand()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const deleteEdge = useDeleteEdge()
  const { add } = useCommand()

  return function updateEdge({
    target,
    ...rawEdgeSource
  }: RawEdgeSourceAndTarget): void {
    if (target == null) return
    const edgeSource = convertToEdgeSource(rawEdgeSource)
    if (
      rawEdgeSource.oldEdge != null &&
      rawEdgeSource.oldEdge.target === target &&
      (rawEdgeSource.oldEdge.source !== rawEdgeSource.source ||
        rawEdgeSource.oldEdge.sourceHandle !== rawEdgeSource.sourceHandle)
    ) {
      void deleteEdge(rawEdgeSource.oldEdge)
    }

    switch (edgeSource.sourceType) {
      case 'socialPreview': {
        const step = steps?.find((step) => step.id === target)

        if (step == null) return

        add({
          parameters: {
            execute: {
              selectedStepId: step.id as string | undefined,
              parentOrder: 0
            },
            undo: {
              selectedStepId: steps?.[0]?.id,
              parentOrder: (step.parentOrder ?? 0) + 1
            }
          },
          execute({ selectedStepId, parentOrder }) {
            dispatch({
              type: 'SetEditorFocusAction',
              selectedStepId,
              activeSlide: ActiveSlide.JourneyFlow
            })
            void blockOrderUpdate({
              variables: {
                id: step.id,
                parentOrder
              },
              optimisticResponse: {
                blockOrderUpdate: getNewParentOrder(
                  steps ?? [],
                  step,
                  parentOrder
                )
              }
            })
          }
        })
        break
      }
      case 'step': {
        const step = steps?.find((step) => step.id === edgeSource.stepId)

        if (step == null) return

        add({
          parameters: {
            execute: { nextBlockId: target, selectedStepId: target },
            undo: {
              nextBlockId: step.nextBlockId,
              selectedStepId: step.nextBlockId ?? step.id
            }
          },
          execute({ nextBlockId, selectedStepId }) {
            dispatch({
              type: 'SetEditorFocusAction',
              selectedStepId,
              activeSlide: ActiveSlide.JourneyFlow
            })
            void stepBlockNextBlockUpdate({
              variables: {
                id: step.id,
                nextBlockId
              },
              optimisticResponse: {
                stepBlockUpdate: {
                  id: step.id,
                  __typename: 'StepBlock',
                  nextBlockId
                }
              }
            })
          }
        })
        break
      }
      case 'action': {
        const step = steps?.find((step) => step.id === edgeSource.stepId)
        if (step == null) return

        const block = searchBlocks([step], edgeSource.blockId)
        if (block == null) break

        addAction({
          blockId: block.id,
          blockTypename: block.__typename,
          action: {
            __typename: 'NavigateToBlockAction',
            gtmEventName: null,
            parentBlockId: block.id,
            blockId: target
          },
          editorFocus: {
            selectedStepId: target,
            activeSlide: ActiveSlide.JourneyFlow
          },
          undoAction: get(block, 'action'),
          undoEditorFocus: {
            selectedStepId: get(block, 'action.blockId') ?? step.id,
            activeSlide: ActiveSlide.JourneyFlow
          }
        })
        break
      }
    }
  }
}
