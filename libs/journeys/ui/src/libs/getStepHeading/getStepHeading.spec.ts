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
    const stepChildren: TreeBlock[] = [
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

    const steps: TreeBlock[] = [
      {
        ...stepBlock,
        children: stepChildren
      }
    ]

    expect(getStepHeading({ stepId: 'step.id', stepChildren, steps })).toEqual(
      'Heading'
    )
  })

  it('returns step number if there are no typography blocks', () => {
    const stepChildren: TreeBlock[] = []
    const steps: TreeBlock[] = [
      {
        ...stepBlock,
        children: stepChildren
      }
    ]

    expect(getStepHeading({ stepId: 'step.id', stepChildren, steps })).toEqual(
      'Step 1'
    )
  })

  it('returns Untitled step if no typogrpahy blocks and id not matched', () => {
    const stepChildren: TreeBlock[] = []
    const steps: TreeBlock[] = [
      {
        ...stepBlock,
        children: stepChildren
      }
    ]

    expect(
      getStepHeading({ stepId: 'anotherStep.id', stepChildren, steps })
    ).toEqual('Untitled step')
  })

  it('returns Untitled step if no typogrpahy blocks and id is null', () => {
    const stepChildren: TreeBlock[] = []
    const steps: TreeBlock[] = [
      {
        ...stepBlock,
        children: stepChildren
      }
    ]

    expect(getStepHeading({ stepId: null, stepChildren, steps })).toEqual(
      'Untitled step'
    )
  })
})
