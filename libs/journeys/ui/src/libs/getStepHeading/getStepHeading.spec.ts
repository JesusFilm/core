import { TypographyVariant } from '../../../__generated__/globalTypes'
import type { TreeBlock } from '../block'
import { BlockFields_StepBlock as StepBlock } from '../block/__generated__/BlockFields'

import { getStepHeading } from '.'

describe('getStepHeading', () => {
  const stepBlock: StepBlock = {
    __typename: 'StepBlock',
    id: 'step.id',
    parentBlockId: null,
    parentOrder: null,
    locked: false,
    nextBlockId: null,
    slug: null
  }

  const t = (str: string): string => str

  it('returns text of first typography block with biggest variant', () => {
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
        backdropBlur: null,
        children: [
          {
            __typename: 'ButtonBlock',
            id: 'button0.id',
            parentBlockId: 'card.id',
            parentOrder: 0,
            label: 'Button',
            buttonVariant: null,
            buttonColor: null,
            size: null,
            startIconId: null,
            endIconId: null,
            submitEnabled: null,
            action: null,
            children: []
          },
          {
            __typename: 'TypographyBlock',
            id: 'typography0.id',
            parentBlockId: 'card.id',
            parentOrder: 1,
            align: null,
            color: null,
            variant: TypographyVariant.h2,
            content: 'Sub heading',
            children: []
          },
          {
            __typename: 'ButtonBlock',
            id: 'button1.id',
            parentBlockId: 'card.id',
            parentOrder: 2,
            label: 'Button',
            buttonVariant: null,
            buttonColor: null,
            size: null,
            startIconId: null,
            endIconId: null,
            submitEnabled: null,
            action: null,
            children: []
          },
          {
            __typename: 'TypographyBlock',
            id: 'typography1.id',
            parentBlockId: 'card.id',
            parentOrder: 3,
            align: null,
            color: null,
            variant: TypographyVariant.h1,
            content: 'Heading',
            children: []
          },
          {
            __typename: 'TypographyBlock',
            id: 'typograph2.id',
            parentBlockId: 'card.id',
            parentOrder: 4,
            align: null,
            color: null,
            variant: TypographyVariant.h1,
            content: 'Another heading',
            children: []
          },
          {
            __typename: 'TypographyBlock',
            id: 'typograph3.id',
            parentBlockId: 'card.id',
            parentOrder: 5,
            align: null,
            color: null,
            variant: TypographyVariant.body2,
            content: 'Paragraph',
            children: []
          }
        ]
      }
    ]

    const steps: TreeBlock[] = [
      {
        ...stepBlock,
        children
      }
    ]

    expect(getStepHeading('step.id', children, steps, t)).toBe('Heading')
  })

  it('returns step number if there are no typography blocks', () => {
    const children: TreeBlock[] = []
    const steps: TreeBlock[] = [
      {
        ...stepBlock,
        children
      }
    ]

    expect(
      getStepHeading(
        'step.id',
        children,
        steps,
        jest.fn((str) => 'Step 1')
      )
    ).toBe('Step 1')
  })

  it('returns Untitled step if no typogrpahy blocks and id not matched', () => {
    const children: TreeBlock[] = []
    const steps: TreeBlock[] = [
      {
        ...stepBlock,
        children
      }
    ]

    expect(getStepHeading('anotherStep.id', children, steps, t)).toBe(
      'Untitled'
    )
  })

  it('calls translate function', () => {
    const t = jest.fn((str: string) => str)
    const children: TreeBlock[] = []
    const steps: TreeBlock[] = [
      {
        ...stepBlock,
        children
      }
    ]
    getStepHeading('step.id', children, steps, t)
    expect(t).toHaveBeenCalledWith('Step {{number}}', { number: 1 })
  })
})
