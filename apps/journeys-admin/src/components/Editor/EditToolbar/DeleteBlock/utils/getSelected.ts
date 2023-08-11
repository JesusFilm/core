import findIndex from 'lodash/findIndex'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  SetSelectedBlockByIdAction,
  SetSelectedStepAction
} from '@core/journeys/ui/EditorProvider'

import { BlockDelete } from '../../../../../../__generated__/BlockDelete'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../__generated__/GetJourney'

export interface GetSelectedProps {
  parentOrder: number
  siblings: BlockDelete['blockDelete']
  type: string
  steps: Array<TreeBlock<StepBlock>> // all steps before deletion
  selectedStep?: TreeBlock<StepBlock>
}

export default function getSelected({
  parentOrder,
  siblings,
  type,
  steps,
  selectedStep
}: GetSelectedProps):
  | SetSelectedBlockByIdAction
  | SetSelectedStepAction
  | null {
  // BUG: siblings not returning correct data for blocks nested in a gridBlock - resolve this when we decide how grid will be used
  if (siblings.length > 0 && siblings[0].__typename !== 'StepBlock') {
    const blockToSelect =
      siblings.find((sibling) => sibling.parentOrder === parentOrder - 1) ??
      siblings[parentOrder]
    return {
      type: 'SetSelectedBlockByIdAction',
      id: blockToSelect?.id
    }
  } else if (selectedStep != null && steps.length > 1) {
    const stepToSet =
      type !== 'StepBlock' ? selectedStep : findNextStep(steps, selectedStep)
    return {
      type: 'SetSelectedStepAction',
      step: stepToSet
    }
  } else return null
}

function findNextStep(
  steps: Array<TreeBlock<StepBlock>>,
  selectedStep: TreeBlock<StepBlock>
): TreeBlock<StepBlock> {
  const i = findIndex(steps, (step) => step.id === selectedStep.id)
  if (i === -1) {
    return steps[0]
  } else if (i > 0) {
    return steps[i - 1]
  } else {
    return steps[i + 1]
  }
}
