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
    children: [
      {
        __typename: 'CardBlock',
        id: 'cardBlock.id',
        parentBlockId: 'step8.id',
        parentOrder: 0,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            __typename: 'RadioQuestionBlock',
            id: 'radioQuestionBlock.id',
            parentBlockId: 'cardBlock.id',
            parentOrder: 0,
            children: [
              {
                __typename: 'RadioOptionBlock',
                id: 'radioOptionBlock.id',
                parentBlockId: 'radioQuestionBlock.id',
                parentOrder: 0,
                label: 'Option 1',
                action: {
                  __typename: 'NavigateToBlockAction',
                  parentBlockId: 'radioQuestionBlock.id',
                  gtmEventName: null,
                  blockId: 'step2.id'
                },
                children: []
              }
            ]
          }
        ]
      }
    ]
  }
  const step2: TreeBlock<StepBlock> = {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: 'step3.id',
    children: []
  }
  const step3: TreeBlock<StepBlock> = {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: 'step4.id',
    children: []
  }
  const step4: TreeBlock<StepBlock> = {
    id: 'step4.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 3,
    locked: false,
    nextBlockId: 'step5.id',
    children: []
  }
  const step5: TreeBlock<StepBlock> = {
    id: 'step5.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 4,
    locked: false,
    nextBlockId: 'step6.id',
    children: []
  }
  const step6: TreeBlock<StepBlock> = {
    id: 'step6.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 5,
    locked: false,
    nextBlockId: 'step7.id',
    children: []
  }
  const step7: TreeBlock<StepBlock> = {
    id: 'step7.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 6,
    locked: false,
    nextBlockId: null,
    children: []
  }

  it('should display the active bullet', () => {
    treeBlocksVar([step1, step2, step3, step4, step5, step6, step7])
    blockHistoryVar([step1])
    const { getByTestId } = render(<PaginationBullets />)
    expect(getByTestId('bullet-active')).toBeInTheDocument()
  })

  it('should render the correct sized bullets', () => {
    treeBlocksVar([step1, step2, step3, step4, step5, step6, step7])
    blockHistoryVar([step1, step2, step3])
    const { getAllByTestId } = render(<PaginationBullets />)
    expect(getAllByTestId('bullet-active')).toHaveLength(1)
    expect(getAllByTestId('bullet-adjacent')).toHaveLength(2)
    expect(getAllByTestId('bullet-default')).toHaveLength(4)
  })

  it('should paginate to last bullet if the current step does not have next step', () => {
    treeBlocksVar([step1, step2, step3, step4, step5, step6, step7])
    blockHistoryVar([step7])
    const { getAllByTestId } = render(<PaginationBullets />)
    expect(getAllByTestId('bullet-active')).toHaveLength(1)
    expect(getAllByTestId('bullet-adjacent')).toHaveLength(1)
    expect(getAllByTestId('bullet-default')).toHaveLength(5)
  })

  it('should paginate back if block history has already visited card', () => {
    treeBlocksVar([step1, step2, step3, step4, step5, step6, step7])
    const blockHistory = blockHistoryVar([step1, step2, step3, step4, step2])
    expect(blockHistory).toHaveLength(5)
    const { getAllByTestId } = render(<PaginationBullets />)
    expect(getAllByTestId('bullet-active')).toHaveLength(1)
    expect(getAllByTestId('bullet-adjacent')).toHaveLength(2)
    expect(getAllByTestId('bullet-default')).toHaveLength(4)
    expect(blockHistory).toHaveLength(2)
  })
})
