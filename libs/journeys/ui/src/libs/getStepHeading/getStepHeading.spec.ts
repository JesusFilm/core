import { TreeBlock } from '..'
import { BlockFields_StepBlock as StepBlock } from '../transformer/__generated__/BlockFields'
import { getStepHeading } from '.'

describe('getStepHeading', () => {
  const stepBlock: StepBlock = {
    __typename: 'StepBlock',
    id: 'step.id',
    parentBlockId: null,
    parentOrder: null,
    locked: false,
    nextBlockId: null
  }

  it('returns text of first typography block', () => {
    const children: TreeBlock[] = [
      {
        __typename: 'CardBlock',
        id: 'card.id',
        parentBlockId: 'step.id',
        parentOrder: null,
        backgroundColor: null,
        coverBlockId: null,
        themeMode: null,
        themeName: null,
        fullscreen: false,
        children: [
          {
            __typename: 'TypographyBlock',
            id: 'typography1.id',
            parentBlockId: 'card.id',
            parentOrder: 0,
            align: null,
            color: null,
            variant: null,
            content: 'Heading',
            children: []
          },
          {
            __typename: 'TypographyBlock',
            id: 'typograph2.id',
            parentBlockId: 'card.id',
            parentOrder: 1,
            align: null,
            color: null,
            variant: null,
            content: 'Description',
            children: []
          }
        ]
      }
    ]

    const treeBlocks: TreeBlock[] = [
      {
        ...stepBlock,
        children
      }
    ]

    expect(
      getStepHeading({ blockId: 'step.id', children, treeBlocks })
    ).toEqual('Heading')
  })

  it('returns step number if there are no typography blocks', () => {
    const children: TreeBlock[] = []
    const treeBlocks: TreeBlock[] = [
      {
        ...stepBlock,
        children
      }
    ]

    expect(
      getStepHeading({ blockId: 'step.id', children, treeBlocks })
    ).toEqual('Step 1')
  })

  it('returns Untitled step if no typogrpahy blocks and id not matched', () => {
    const children: TreeBlock[] = []
    const treeBlocks: TreeBlock[] = [
      {
        ...stepBlock,
        children
      }
    ]

    expect(
      getStepHeading({ blockId: 'anotherStep.id', children, treeBlocks })
    ).toEqual('Untitled step')
  })
})
