import { useEditor, TreeBlock } from '@core/journeys/ui'
import { ReactElement, useState } from 'react'
import { CardPreview } from '../../../../../../../CardPreview'
import {
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock
} from '../../../../../../../../../__generated__/GetJourney'

export function NavigateStep(): ReactElement {
  const { state } = useEditor()
  const selectedBlock = state.selectedBlock as
    | TreeBlock<ButtonBlock>
    | undefined

  const currentActionStep =
    state.steps.find(
      ({ id }) =>
        selectedBlock?.action?.__typename === 'NavigateToBlockAction' &&
        id === selectedBlock?.action?.blockId
    ) ?? undefined

  const [selection, setSelection] = useState(currentActionStep)

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
