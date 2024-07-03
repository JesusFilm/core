import { TreeBlock } from '@core/journeys/ui/block/TreeBlock'

import {
  BlockFields,
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { TypographyVariant } from '../../../../../../../../../__generated__/globalTypes'

import { getCardHeadings } from '.'

const card: TreeBlock<CardBlock> = {
  id: 'cardId',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  children: []
}

const typography1: TreeBlock<TypographyBlock> = {
  __typename: 'TypographyBlock',
  id: 'cardId',
  parentBlockId: 'stepId',
  parentOrder: 0,
  align: null,
  color: null,
  content: 'title',
  variant: TypographyVariant.body1,
  children: []
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
  children: []
}

const image: TreeBlock<ImageBlock> = {
  __typename: 'ImageBlock',
  id: 'image0.id',
  src: 'https://url.com',
  width: 1600,
  height: 1067,
  alt: 'random image from unsplash',
  parentBlockId: 'Image1',
  parentOrder: 0,
  blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
  children: []
}

const children: Array<TreeBlock<BlockFields>> = [typography1]

describe('getCardHeading', () => {
  it('should return title content from children', () => {
    const cardHeadings = getCardHeadings({ ...card, children })
    expect(cardHeadings).toEqual(['title'])
  })

  it('should return both title and subtitle content according to typography order', () => {
    const cardHeadings = getCardHeadings({
      ...card,
      children: [...children, typography2]
    })
    expect(cardHeadings).toEqual(['subtitle content', 'title'])
  })

  it('should return typography without a variant', () => {
    const cardHeadings = getCardHeadings({
      ...card,
      children: [...children, { ...typography2, variant: null }]
    })
    expect(cardHeadings).toEqual(['title', 'subtitle content'])
  })

  it('should return image details for imageblock', () => {
    const cardHeadings = getCardHeadings({ ...card, children: [image] })
    expect(cardHeadings).toEqual(['Image', '1600 x 1067 pixels'])
  })
})
