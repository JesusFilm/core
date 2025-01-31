import type { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../../../../../__generated__/BlockFields'

export function getNextStep(
  selectedStep?: TreeBlock<StepBlock>,
  steps?: Array<TreeBlock<StepBlock>>
): TreeBlock<StepBlock> | undefined {
  const currentParentOrder = selectedStep?.parentOrder
  return steps?.find(
    (step) =>
      currentParentOrder != null && currentParentOrder + 1 === step.parentOrder
  )
}
