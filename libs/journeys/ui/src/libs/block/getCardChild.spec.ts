import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { CardFields } from '../../components/Card/__generated__/CardFields'

import { getCardChild } from './getCardChild'
import type { TreeBlock } from './TreeBlock'

const card: TreeBlock<CardFields> = {
  __typename: 'CardBlock',
  id: 'card1.id',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  backgroundColor: null,
  backdropBlur: null,
  coverBlockId: null,
  themeMode: ThemeMode.dark,
  themeName: ThemeName.base,
  fullscreen: false,
  eventLabel: null,
  showAssistant: null,
  expandChatByDefault: null,
  children: []
}

describe('getCardChild', () => {
  it('returns undefined when block is null', () => {
    expect(getCardChild(null)).toBeUndefined()
  })

  it('returns undefined when block is undefined', () => {
    expect(getCardChild(undefined)).toBeUndefined()
  })

  it('returns undefined when no CardBlock child exists', () => {
    const step: TreeBlock = {
      __typename: 'StepBlock',
      id: 'step1.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: []
    }
    expect(getCardChild(step)).toBeUndefined()
  })

  it('returns the CardBlock child when present', () => {
    const step: TreeBlock = {
      __typename: 'StepBlock',
      id: 'step1.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: [card]
    }
    expect(getCardChild(step)).toBe(card)
  })

  it('skips non-CardBlock siblings and returns the CardBlock', () => {
    const sibling: TreeBlock = {
      __typename: 'TypographyBlock',
      id: 'typ.id',
      parentBlockId: 'step1.id',
      parentOrder: 0,
      align: null,
      color: null,
      content: 'hi',
      variant: null,
      settings: null,
      children: []
    }
    const step: TreeBlock = {
      __typename: 'StepBlock',
      id: 'step1.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: false,
      nextBlockId: null,
      slug: null,
      children: [sibling, card]
    }
    expect(getCardChild(step)).toBe(card)
  })
})
