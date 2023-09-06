import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../../../../__generated__/GetJourney'
import { steps } from '../../data'

import { getNextStep } from '.'

describe('getNextStep', () => {
  it('should return the next step', () => {
    const selectedStep: TreeBlock<StepBlock> = {
      ...steps[0],
      nextBlockId: null
    }
    const expected: TreeBlock<StepBlock> = steps[1]

    expect(getNextStep(selectedStep, steps)).toEqual(expected)
  })
})
