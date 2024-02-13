import { render } from '@testing-library/react'

import { TreeBlock, blockHistoryVar, treeBlocksVar } from '../../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../../libs/block/__generated__/BlockFields'

import { PaginationBullets } from './PaginationBullets'

describe('PaginationBullets', () => {
  const step1: TreeBlock<StepBlock> = {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: null,
    children: []
  }
  const step2: TreeBlock<StepBlock> = {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: null,
    children: []
  }
  const step3: TreeBlock<StepBlock> = {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: null,
    children: []
  }

  it('should display the active bullet', () => {
    treeBlocksVar([step1, step2, step3])
    blockHistoryVar([step1])
    const { getByTestId } = render(<PaginationBullets />)
    expect(getByTestId('activeBullet')).toBeInTheDocument()
  })
})
