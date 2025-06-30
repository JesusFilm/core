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
  children: []
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
      'step1.id': { x: 400, y: -8 },
      'step2.id': { x: 800, y: -8 },
      'step3.id': { x: 1200, y: -8 }
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
      'step1.id': { x: 600, y: -8 }
    })
  })
})
