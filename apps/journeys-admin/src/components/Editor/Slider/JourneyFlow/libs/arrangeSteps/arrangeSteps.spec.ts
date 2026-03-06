import { TreeBlock } from '@core/journeys/ui/block'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '@core/journeys/ui/block/__generated__/BlockFields'

import {
  ButtonSize,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'

import { arrangeSteps } from '.'

const button: TreeBlock<ButtonBlock> = {
  __typename: 'ButtonBlock',
  id: 'id',
  parentBlockId: 'parentBlockId',
  parentOrder: 0,
  label: 'test button',
  buttonVariant: null,
  buttonColor: null,
  size: ButtonSize.medium,
  startIconId: null,
  endIconId: null,
  submitEnabled: null,
  action: {
    __typename: 'NavigateToBlockAction',
    parentBlockId: 'responseAction.id',
    gtmEventName: 'responseAction',
    blockId: 'step1.id'
  },
  children: [],
  settings: null,
  eventLabel: null
}

const card: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  coverBlockId: null,
  parentOrder: 0,
  backgroundColor: null,
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  fullscreen: false,
  backdropBlur: null,
  eventLabel: null,
  children: [button]
}

const steps: Array<TreeBlock<StepBlock>> = [
  {
    id: 'step0.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'step1.id',
    slug: null,
    children: []
  },
  {
    id: 'step1.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 1,
    locked: false,
    nextBlockId: 'step2.id',
    slug: null,
    children: []
  },
  {
    id: 'step2.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 2,
    locked: false,
    nextBlockId: 'step3.id',
    slug: null,
    children: []
  },
  {
    id: 'step3.id',
    __typename: 'StepBlock',
    parentBlockId: null,
    parentOrder: 3,
    locked: false,
    nextBlockId: null,
    slug: null,
    children: []
  }
]

describe('arrangeSteps', () => {
  it('should return the positions of each step', () => {
    const positions = arrangeSteps(steps)
    expect(positions).toEqual({
      'step0.id': { x: 0, y: -8 },
      'step1.id': { x: 0, y: 145 },
      'step2.id': { x: 0, y: 298 },
      'step3.id': { x: 0, y: 451 }
    })
  })

  it('should handle a single step', () => {
    const positions = arrangeSteps([steps[0]])
    expect(positions).toEqual({ 'step0.id': { x: 0, y: -8 } })
  })

  it('should return positions if there are action within a step', () => {
    const positions = arrangeSteps([
      {
        id: 'step0.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        slug: null,
        children: [card]
      },
      { ...steps[1] }
    ])
    expect(positions).toEqual({
      'step0.id': { x: 0, y: -8 },
      'step1.id': { x: 0, y: 172 }
    })
  })

  it('should arrange multiple isolated directed cycles', () => {
    const cycleSteps = [
      {
        id: 'a.id',
        __typename: 'StepBlock' as const,
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'b.id' as string | null,
        slug: null,
        children: []
      },
      {
        id: 'b.id',
        __typename: 'StepBlock' as const,
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: 'a.id' as string | null,
        slug: null,
        children: []
      },
      {
        id: 'c.id',
        __typename: 'StepBlock' as const,
        parentBlockId: null,
        parentOrder: 2,
        locked: false,
        nextBlockId: 'd.id' as string | null,
        slug: null,
        children: []
      },
      {
        id: 'd.id',
        __typename: 'StepBlock' as const,
        parentBlockId: null,
        parentOrder: 3,
        locked: false,
        nextBlockId: 'c.id' as string | null,
        slug: null,
        children: []
      }
    ]
    const edges = [
      { id: 'e1', source: 'a.id', target: 'b.id' },
      { id: 'e2', source: 'b.id', target: 'a.id' },
      { id: 'e3', source: 'c.id', target: 'd.id' },
      { id: 'e4', source: 'd.id', target: 'c.id' }
    ]
    const positions = arrangeSteps(
      cycleSteps as Array<TreeBlock<StepBlock>>,
      edges
    )
    expect(Object.keys(positions)).toHaveLength(4)
    expect(positions['a.id']).toBeDefined()
    expect(positions['b.id']).toBeDefined()
    expect(positions['c.id']).toBeDefined()
    expect(positions['d.id']).toBeDefined()
  })
})
