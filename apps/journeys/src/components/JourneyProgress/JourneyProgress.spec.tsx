import type { TreeBlock } from '@core/journeys/ui/block'
import { activeBlockVar, treeBlocksVar } from '@core/journeys/ui/block'
import { render } from '@testing-library/react'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import { JourneyProgress } from '.'

describe('JourneyProgress', () => {
  it('returns 0 when no activeBlock or treeBlocks', () => {
    const { getByRole } = render(<JourneyProgress />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('returns 0 when activeBlock not part of treeBlocks', () => {
    const activeBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'Step1',
      parentBlockId: null,
      parentOrder: 0,
      locked: true,
      nextBlockId: 'Step2',
      children: []
    }
    activeBlockVar(activeBlock)
    const blocks: TreeBlock[] = []
    treeBlocksVar(blocks)
    const { getByRole } = render(<JourneyProgress />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('returns 0 when activeBlock first block of four in TreeBlock', () => {
    const activeBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'Step1',
      parentBlockId: null,
      parentOrder: 0,
      locked: true,
      nextBlockId: 'Step2',
      children: []
    }
    activeBlockVar(activeBlock)
    const blocks: TreeBlock[] = [
      activeBlock,
      {
        __typename: 'StepBlock',
        id: 'Step2',
        parentBlockId: null,
        parentOrder: 0,
        locked: true,
        nextBlockId: 'Step3',
        children: []
      },
      {
        __typename: 'StepBlock',
        id: 'Step3',
        parentBlockId: null,
        parentOrder: 1,
        locked: true,
        nextBlockId: 'Step4',
        children: []
      },
      {
        __typename: 'StepBlock',
        id: 'Step4',
        parentBlockId: null,
        parentOrder: 2,
        locked: true,
        nextBlockId: null,
        children: []
      }
    ]
    treeBlocksVar(blocks)
    const { getByRole } = render(<JourneyProgress />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('returns 50 when activeBlock second block of four in TreeBlock', () => {
    const activeBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'Step2',
      parentBlockId: null,
      parentOrder: 0,
      locked: true,
      nextBlockId: 'Step3',
      children: []
    }
    activeBlockVar(activeBlock)
    const blocks: TreeBlock[] = [
      {
        __typename: 'StepBlock',
        id: 'Step1',
        parentBlockId: null,
        parentOrder: 0,
        locked: true,
        nextBlockId: 'Step2',
        children: []
      },
      activeBlock,
      {
        __typename: 'StepBlock',
        id: 'Step3',
        parentBlockId: null,
        parentOrder: 1,
        locked: true,
        nextBlockId: 'Step4',
        children: []
      },
      {
        __typename: 'StepBlock',
        id: 'Step4',
        parentBlockId: null,
        parentOrder: 2,
        locked: true,
        nextBlockId: null,
        children: []
      }
    ]
    treeBlocksVar(blocks)
    const { getByRole } = render(<JourneyProgress />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  })
})
