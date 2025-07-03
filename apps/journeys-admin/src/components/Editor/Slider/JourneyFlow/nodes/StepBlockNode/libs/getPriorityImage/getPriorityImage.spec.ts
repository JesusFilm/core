import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock
} from '../../../../../../../../../__generated__/BlockFields'

import { getPriorityImage } from '.'

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
  children: [],
  scale: null,
  focalLeft: 50,
  focalTop: 50
}

const card: TreeBlock<CardBlock> = {
  id: 'cardId',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: true,
  backdropBlur: null,
  children: [image]
}

const emptyCard: TreeBlock<CardBlock> = {
  id: 'cardId',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: true,
  backdropBlur: null,
  children: []
}

describe('getPriorityImage', () => {
  it('should return the image source string', () => {
    const priorityImage = getPriorityImage(card.children)
    expect(priorityImage).toBe('https://url.com')
  })

  it('should return the null if no image block is given', () => {
    const priorityImage = getPriorityImage(emptyCard.children)
    expect(priorityImage).toBeUndefined()
  })
})
