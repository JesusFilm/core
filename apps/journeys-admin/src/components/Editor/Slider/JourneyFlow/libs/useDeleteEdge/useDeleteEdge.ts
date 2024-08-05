import get from 'lodash/get'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'

import { useStepBlockNextBlockUpdateMutation } from '../../../../../../libs/useStepBlockNextBlockUpdateMutation'
import { useActionCommand } from '../../../../utils/useActionCommand'
import { RawEdgeSource, convertToEdgeSource } from '../convertToEdgeSource'

export function useDeleteEdge(): (
  rawEdgeSource: RawEdgeSource
) => Promise<void> {
  const { addAction } = useActionCommand()
  const [stepBlockNextBlockUpdate] = useStepBlockNextBlockUpdateMutation()
  const { journey } = useJourney()
  const {
    state: { steps }
  } = useEditor()

  return async function deleteEdge(
    rawEdgeSource: RawEdgeSource
  ): Promise<void> {
    if (journey == null) return

    const edgeSource = convertToEdgeSource(rawEdgeSource)

    switch (edgeSource.sourceType) {
      case 'step':
        void stepBlockNextBlockUpdate({
          variables: {
            id: edgeSource.stepId,
            journeyId: journey.id,
            input: {
              nextBlockId: null
            }
          },
          optimisticResponse: {
            stepBlockUpdate: {
              id: edgeSource.stepId,
              __typename: 'StepBlock',
              nextBlockId: null
            }
          }
        })
        break
      case 'action': {
        const step = steps?.find((step) => step.id === edgeSource.stepId)
        const block = searchBlocks(
          step != null ? [step] : [],
          edgeSource.blockId
        )
        if (block != null)
          addAction({
            blockId: block.id,
            blockTypename: block.__typename,
            action: null,
            undoAction: get(block, 'action'),
            editorFocus: {
              activeSlide: ActiveSlide.JourneyFlow
            }
          })
        break
      }
    }
  }
}
