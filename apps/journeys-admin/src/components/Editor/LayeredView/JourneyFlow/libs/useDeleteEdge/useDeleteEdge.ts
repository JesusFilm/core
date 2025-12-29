import get from 'lodash/get'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'
import { useActionCommand } from '../../../../utils/useActionCommand'
import { RawEdgeSource, convertToEdgeSource } from '../convertToEdgeSource'

export function useDeleteEdge(): (rawEdgeSource: RawEdgeSource) => void {
  const { addAction } = useActionCommand()
  const { add } = useCommand()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const {
    dispatch,
    state: { steps }
  } = useEditor()

  return function deleteEdge(rawEdgeSource: RawEdgeSource): void {
    const edgeSource = convertToEdgeSource(rawEdgeSource)

    switch (edgeSource.sourceType) {
      case 'step': {
        const step = steps?.find((step) => step.id === edgeSource.stepId)

        if (step == null) return

        add({
          parameters: {
            execute: { nextBlockId: null, selectedStepId: step.id },
            undo: {
              nextBlockId: step.nextBlockId,
              selectedStepId: step.nextBlockId
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
                id: edgeSource.stepId,
                nextBlockId
              },
              optimisticResponse: {
                stepBlockUpdate: {
                  id: edgeSource.stepId,
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
        if (block == null) return

        addAction({
          blockId: block.id,
          blockTypename: block.__typename,
          action: null,
          editorFocus: {
            selectedStepId: step.id,
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
