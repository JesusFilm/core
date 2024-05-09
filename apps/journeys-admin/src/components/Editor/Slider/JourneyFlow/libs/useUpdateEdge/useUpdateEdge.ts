import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { useBlockOrderUpdateMutation } from '../../../../../../libs/useBlockOrderUpdateMutation'
import { useNavigateToBlockActionUpdateMutation } from '../../../../../../libs/useNavigateToBlockActionUpdateMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'

export function useUpdateEdge(): (
  source?: string | null,
  sourceHandle?: string | null,
  target?: string | null
) => Promise<void> {
  const { journey } = useJourney()
  const {
    state: { steps },
    dispatch
  } = useEditor()

  const [blockOrderUpdate] = useBlockOrderUpdateMutation()
  const [navigateToBlockActionUpdate] = useNavigateToBlockActionUpdateMutation()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()

  async function updateEdge(
    source?: string,
    sourceHandle?: string | null,
    target?: string
  ): Promise<void> {
    const socialEdge = source === 'SocialPreview'
    const actionEdge = sourceHandle != null
    const stepEdge = source != null && !actionEdge
    if (journey == null || target == null) return
    let step: TreeBlock<StepBlock> | undefined

    if (socialEdge) {
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
        step = steps?.find((step) => step.id === stepId)
      }
    } else if (stepEdge) {
      const { data } = await stepBlockNextBlockUpdate({
        variables: {
          id: source,
          journeyId: journey.id,
          input: {
            nextBlockId: target
          }
        },
        optimisticResponse: {
          stepBlockUpdate: {
            id: source,
            __typename: 'StepBlock',
            nextBlockId: target
          }
        }
      })
      if (data != null) {
        step = steps?.find((step) => step.id === target)
      }
    } else if (actionEdge) {
      const selectedStep = steps?.find((step) => step.id === source)
      const block = searchBlocks(
        selectedStep != null ? [selectedStep] : [],
        sourceHandle
      )
      if (block != null) {
        const data = await navigateToBlockActionUpdate(block, target)
        if (data != null) {
          step = selectedStep
        }
      }
    }

    if (step != null) {
      dispatch({
        type: 'SetSelectedStepAction',
        selectedStep: step
      })
    }
  }

  return updateEdge
}
