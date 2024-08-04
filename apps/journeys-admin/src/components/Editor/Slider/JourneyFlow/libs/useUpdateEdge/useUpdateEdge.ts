import get from 'lodash/get'
import { Edge } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { useBlockOrderUpdateMutation } from '../../../../../../libs/useBlockOrderUpdateMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'
import { useActionCommand } from '../../../../utils/useActionCommand'
import { RawEdgeSource, convertToEdgeSource } from '../convertToEdgeSource'
import { useDeleteEdge } from '../useDeleteEdge'

type RawEdgeSourceAndTarget = RawEdgeSource & { target?: string | null } & {
  oldEdge?: Edge
}

export function useUpdateEdge(): (
  rawEdgeSource: RawEdgeSourceAndTarget
) => Promise<void> {
  const { journey } = useJourney()
  const {
    state: { steps },
    dispatch
  } = useEditor()

  const [blockOrderUpdate] = useBlockOrderUpdateMutation()
  const { addAction } = useActionCommand()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const deleteEdge = useDeleteEdge()

  async function updateEdge({
    target,
    ...rawEdgeSource
  }: RawEdgeSourceAndTarget): Promise<void> {
    if (journey == null || target == null) return
    let selectedStep: TreeBlock<StepBlock> | undefined
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
        const { data } = await blockOrderUpdate({
          variables: {
            id: target,
            journeyId: journey.id,
            parentOrder: 0
          },
          optimisticResponse: {
            blockOrderUpdate: [
              {
                id: target,
                __typename: 'StepBlock',
                parentOrder: 0
              }
            ]
          }
        })
        if (data != null) {
          const stepId = data.blockOrderUpdate[0].id
          selectedStep = steps?.find((step) => step.id === stepId)
        }
        break
      }
      case 'step': {
        const { data } = await stepBlockNextBlockUpdate({
          variables: {
            id: edgeSource.stepId,
            journeyId: journey.id,
            input: {
              nextBlockId: target
            }
          },
          optimisticResponse: {
            stepBlockUpdate: {
              id: edgeSource.stepId,
              __typename: 'StepBlock',
              nextBlockId: target
            }
          }
        })
        if (data != null) {
          selectedStep = steps?.find((step) => step.id === target)
        }
        break
      }
      case 'action': {
        const step = steps?.find((step) => step.id === edgeSource.stepId)
        const block = searchBlocks(
          step != null ? [step] : [],
          edgeSource.blockId
        )
        if (block != null) {
          await addAction({
            blockId: block.id,
            blockTypename: block.__typename,
            action: {
              __typename: 'NavigateToBlockAction',
              gtmEventName: null,
              parentBlockId: block.id,
              blockId: target
            },
            undoAction: get(block, 'action'),
            editorFocus: {
              activeSlide: ActiveSlide.JourneyFlow
            }
          })
          selectedStep = steps?.find((step) => step.id === target)
        }
        break
      }
    }

    if (selectedStep != null) {
      dispatch({
        type: 'SetSelectedStepAction',
        selectedStep
      })
    }
  }

  return updateEdge
}
