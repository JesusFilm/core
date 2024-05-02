import { TreeBlock } from '@core/journeys/ui/block'
import { arrangeSteps } from '.'
import { BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'

const steps: Array<TreeBlock<StepBlock>> = [
  {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step1.id',
    children: []
  },
  {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: 'step2.id',
    children: []
  },
  {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: 'step3.id',
    children: []
  },
  {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 3,
    locked: false,
    nextBlockId: null,
    children: []
  }
]

describe('arrangeSteps', () => {
  it('should return the positions of each step', () => {
    const positions = arrangeSteps(steps)
    expect(positions).toEqual({
      'step0.id': { x: -200, y: 0 },
      'step1.id': { x: -200, y: 226 },
      'step2.id': { x: -200, y: 452 },
      'step3.id': { x: -200, y: 678 }
    })
  })
})
