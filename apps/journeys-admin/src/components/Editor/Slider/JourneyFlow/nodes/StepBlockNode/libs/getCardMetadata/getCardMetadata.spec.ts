import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_TypographyBlock as TypographyBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  TypographyVariant,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'

import { getCardMetadata } from '.'

const typography1: TreeBlock<TypographyBlock> = {
  __typename: 'TypographyBlock',
  id: 'typography1.id',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  align: null,
  color: null,
  content: 'title content',
  variant: TypographyVariant.h1,
  children: []
}

const typography2: TreeBlock<TypographyBlock> = {
  __typename: 'TypographyBlock',
  id: 'typography2.id',
  parentBlockId: 'card1.id',
  parentOrder: 2,
  align: null,
  color: null,
  content: 'subtitle content',
  variant: TypographyVariant.body1,
  children: []
}

const image: TreeBlock<ImageBlock> = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: 'card1.id',
  parentOrder: 3,
  src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
  alt: 'public',
  width: 1920,
  height: 1080,
  blurhash: '',
  children: []
}

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  startAt: 0,
  endAt: 200,
  muted: false,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  objectFit: null,
  video: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'Translation',
        value: 'FallingPlates'
      }
    ],
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    }
  },
  posterBlockId: null,
  children: []
}

const card: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: image.id,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  children: [image, typography1, typography2]
}

describe('getCardMetadata', () => {
  it('should return card metadata', () => {
    const cardMetadata = getCardMetadata(card)
    expect(cardMetadata).toEqual({
      title: 'title content',
      subtitle: 'subtitle content',
      bgImage: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
      priorityBlock: typography1
    })
  })

  it('should return card metadata from videoblock', () => {
    const videoCard = {
      ...card,
      children: [video, image, typography1, typography2]
    }
    const cardMetadata = getCardMetadata(videoCard)
    expect(cardMetadata).toEqual({
      title: 'FallingPlates',
      subtitle: '0:00-3:20',
      bgImage:
        'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
      priorityBlock: video
    })
  })
})
