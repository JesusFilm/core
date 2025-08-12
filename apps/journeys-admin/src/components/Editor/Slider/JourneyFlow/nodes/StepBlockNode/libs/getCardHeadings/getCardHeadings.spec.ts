import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'

import {
  BlockFields,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { TypographyVariant } from '../../../../../../../../../__generated__/globalTypes'

import { getCardHeadings } from '.'

const typography1: TreeBlock<TypographyBlock> = {
  __typename: 'TypographyBlock',
  id: 'cardId',
  parentBlockId: 'stepId',
  parentOrder: 0,
  align: null,
  color: null,
  content: 'title',
  variant: TypographyVariant.body1,
  children: [],
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}

const typography2: TreeBlock<TypographyBlock> = {
  __typename: 'TypographyBlock',
  id: 'cardId',
  parentBlockId: 'stepId',
  parentOrder: 0,
  align: null,
  color: null,
  content: 'subtitle content',
  variant: TypographyVariant.h1,
  children: [],
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}

const children: Array<TreeBlock<BlockFields>> = [typography1]

describe('getCardHeading', () => {
  it('should return title content from children', () => {
    const cardHeadings = getCardHeadings(children)
    expect(cardHeadings).toEqual(['title'])
  })

  it('should return both title and subtitle content according to typography order', () => {
    const cardHeadings = getCardHeadings([...children, typography2])
    expect(cardHeadings).toEqual(['subtitle content', 'title'])
  })

  it('should return typography without a variant', () => {
    const cardHeadings = getCardHeadings([
      ...children,
      { ...typography2, variant: null }
    ])
    expect(cardHeadings).toEqual(['title', 'subtitle content'])
  })
})
