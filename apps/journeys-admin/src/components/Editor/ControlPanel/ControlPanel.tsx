import { ReactElement } from 'react'
import { CardPreview } from '../../CardPreview'
import { Attributes } from './Attributes'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'
import { TreeBlock } from '@core/journeys/ui'

export interface ControlPanelProps {
  onSelect?: (card: TreeBlock<StepBlock>) => void
  selected?: TreeBlock<StepBlock>
  steps: Array<TreeBlock<StepBlock>>
}

export function ControlPanel({
  steps,
  selected,
  onSelect
}: ControlPanelProps): ReactElement {
  return (
    <>
      <div>ControlPanel</div>
      <Attributes />
      <CardPreview onSelect={onSelect} selected={selected} steps={steps} />
    </>
  )
}
