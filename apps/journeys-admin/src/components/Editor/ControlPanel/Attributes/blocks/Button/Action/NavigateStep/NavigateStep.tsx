import { useEditor, TreeBlock } from '@core/journeys/ui'
import { ReactElement } from 'react'
import { CardPreview } from '../../../../../../../CardPreview'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../../../__generated__/GetJourney'

export function NavigateStep(): ReactElement {
  const { state, dispatch } = useEditor()

  function handleSelectStep(step: TreeBlock<StepBlock>): void {
    dispatch({ type: 'SetSelectedStepAction', step })
  }

  return (
    <CardPreview
      selected={state.selectedStep}
      steps={state.steps}
      // select next step with out updating canvas
      onSelect={handleSelectStep}
    />
  )
}
