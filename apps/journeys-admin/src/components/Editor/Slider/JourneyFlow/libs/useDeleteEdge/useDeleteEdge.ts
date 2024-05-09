import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import { useBlockActionDeleteMutation } from '../../../../../../libs/useBlockActionDeleteMutation'
import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'

export function useDeleteEdge(): (
  source?: string,
  sourceHandle?: string | null
) => Promise<void> {
  const [blockActionDelete] = useBlockActionDeleteMutation()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const { journey } = useJourney()
  const {
    state: { steps }
  } = useEditor()

  async function deleteEdge(
    source?: string,
    sourceHandle?: string
  ): Promise<void> {
    const socialEdge = source === 'SocialPreview'
    const actionEdge = sourceHandle != null
    const stepEdge = source != null && !actionEdge
    if (journey == null || socialEdge) return

    if (stepEdge) {
      void stepBlockNextBlockUpdate({
        variables: {
          id: source,
          journeyId: journey.id,
          input: {
            nextBlockId: null
          }
        },
        optimisticResponse: {
          stepBlockUpdate: {
            id: source,
            __typename: 'StepBlock',
            nextBlockId: null
          }
        }
      })
    } else if (actionEdge) {
      const step = steps?.find((step) => step.id === source)
      const block = searchBlocks(step != null ? [step] : [], sourceHandle)
      if (block != null) {
        void blockActionDelete(block)
      }
    }
  }

  return deleteEdge
}
