import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import { JourneyProgress } from '.'
import { renderWithApolloClient } from '../../../test/testingLibrary'
import { activeBlockVar, treeBlocksVar } from '../../libs/client/cache/blocks'
import { TreeBlock } from '../../libs/TreeBlock'

describe('JourneyProgress', () => {
  it('returns 0 when no activeBlock or treeBlocks', () => {
    const { getByRole } = renderWithApolloClient(<JourneyProgress />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('returns 100 when nextBlockId not set on activeBlock', () => {
    const activeBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'Step1',
      parentBlockId: null,
      locked: true,
      nextBlockId: null,
      children: []
    }
    activeBlockVar(activeBlock)
    const blocks: TreeBlock[] = [activeBlock]
    treeBlocksVar(blocks)
    const { getByRole } = renderWithApolloClient(<JourneyProgress />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('returns 0 when activeBlock not part of treeBlocks', () => {
    const activeBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'Step1',
      parentBlockId: null,
      locked: true,
      nextBlockId: 'Step2',
      children: []
    }
    activeBlockVar(activeBlock)
    const blocks: TreeBlock[] = []
    treeBlocksVar(blocks)
    const { getByRole } = renderWithApolloClient(<JourneyProgress />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('returns 0 when activeBlock first block of four in TreeBlock', () => {
    const activeBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'Step1',
      parentBlockId: null,
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
        locked: true,
        nextBlockId: 'Step3',
        children: []
      },
      {
        __typename: 'StepBlock',
        id: 'Step3',
        parentBlockId: null,
        locked: true,
        nextBlockId: 'Step4',
        children: []
      },
      {
        __typename: 'StepBlock',
        id: 'Step4',
        parentBlockId: null,
        locked: true,
        nextBlockId: null,
        children: []
      }
    ]
    treeBlocksVar(blocks)
    const { getByRole } = renderWithApolloClient(<JourneyProgress />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('returns 50 when activeBlock second block of four in TreeBlock', () => {
    const activeBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'Step2',
      parentBlockId: null,
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
        locked: true,
        nextBlockId: 'Step2',
        children: []
      },
      activeBlock,
      {
        __typename: 'StepBlock',
        id: 'Step3',
        parentBlockId: null,
        locked: true,
        nextBlockId: 'Step4',
        children: []
      },
      {
        __typename: 'StepBlock',
        id: 'Step4',
        parentBlockId: null,
        locked: true,
        nextBlockId: null,
        children: []
      }
    ]
    treeBlocksVar(blocks)
    const { getByRole } = renderWithApolloClient(<JourneyProgress />)
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
  })
})
