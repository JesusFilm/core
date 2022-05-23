import { JourneyFields_blocks_StepBlock as StepBlock } from '../context/__generated__/JourneyFields'
import { TreeBlock } from '..'
import { getStepHeading } from '.'

describe('getStepHeading', () => {
  it('returns text of first typography block', () => {
    const stepBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: null,
      locked: false,
      nextBlockId: null,
      children: [
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
    }
    expect(getStepHeading(stepBlock)).toEqual('Heading')
  })

  it('returns undefined if there are no typography blocks', () => {
    const stepBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: null,
      locked: false,
      nextBlockId: null,
      children: []
    }
    expect(getStepHeading(stepBlock)).toBeUndefined()
  })
})
