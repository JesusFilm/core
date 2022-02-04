import { useEditor, TreeBlock } from '@core/journeys/ui'
import { ReactElement, useState } from 'react'
import { CardPreview } from '../../../../../../../CardPreview'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../../../__generated__/GetJourney'

export function NavigateStep(): ReactElement {
  const { state } = useEditor()
  const [selection, setSelection] = useState(state.selectedStep)

  function handleSelectStep(step: TreeBlock<StepBlock>): void {
    // update mutation to set action to navigate to next step
    setSelection(step)
  }

  return (
    <CardPreview
      selected={selection}
      steps={state.steps}
      onSelect={handleSelectStep}
    />
  )
}
