import { TreeBlock } from '@core/journeys/ui'
import last from 'lodash/last'
import { BlockDelete } from '../../../../../../__generated__/BlockDelete'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../__generated__/GetJourney'

interface getSeletedReturn {
  type: 'SetSelectedBlockByIdAction' | 'SetSelectedStepAction'
  id?: string
  step?: TreeBlock<StepBlock>
}

interface getSelectedProps {
  parentOrder: number
  siblings: BlockDelete['blockDelete']
  type: string
  steps: Array<TreeBlock<StepBlock>>
  selectedStep?: TreeBlock<StepBlock>
}

export default function getSelected({
  parentOrder,
  siblings,
  type,
  steps,
  selectedStep
}: getSelectedProps): getSeletedReturn | null {
  // BUG: siblings not returning correct data for blocks nested in a gridBlock - resolve this when we decide how grid will be used
  if (siblings.length > 0) {
    const blockToSelect =
      siblings.find((sibling) => sibling.parentOrder === parentOrder) ??
      last(siblings)
    return {
      type: 'SetSelectedBlockByIdAction',
      id: blockToSelect?.id
    }
  } else if (selectedStep != null && steps.length > 0) {
    // BUG: newly created blocks after deletion is selecting the first step
    // REFACTOR: update algorithm to always selected the step to the left of deleted step
    const stepToSet =
      type !== 'StepBlock'
        ? selectedStep
        : steps.find((step) => step.nextBlockId === selectedStep.id) ??
          last(steps)
    return {
      type: 'SetSelectedStepAction',
      step: stepToSet
    }
  } else return null
}
