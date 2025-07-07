import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock,
  BlockFields_TypographyBlock as TypographyBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  TypographyVariant,
  VideoBlockSource
} from '../../../../../../../../../__generated__/globalTypes'

import { getCardMetadata } from '.'

const typography: TreeBlock<TypographyBlock> = {
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

const button1: TreeBlock<ButtonBlock> = {
  __typename: 'ButtonBlock',
  id: 'button1.id',
  parentBlockId: 'card1.id',
  parentOrder: 2,
  label: 'button',
  buttonVariant: null,
  buttonColor: null,
  size: null,
  startIconId: null,
  endIconId: null,
  submitEnabled: null,
  action: null,
  children: [],
  settings: null
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
  children: [],
  scale: null,
  focalLeft: 50,
  focalTop: 50
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
  mediaVideo: {
    __typename: 'Video' as const,
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'VideoTitle',
        value: 'FallingPlates'
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    variantLanguages: [
      {
        __typename: 'Language',
        id: '529',
        name: [
          {
            __typename: 'LanguageName',
            value: 'English',
            primary: true
          }
        ]
      }
    ]
  },
  posterBlockId: null,
  children: []
}

const radioQuestionBlock: TreeBlock<RadioQuestionBlock> = {
  __typename: 'RadioQuestionBlock',
  id: 'RadioQuestion1',
  parentBlockId: 'parent.id',
  parentOrder: 3,
  children: [
    {
      __typename: 'RadioOptionBlock',
      id: 'RadioOption1',
      label: 'Option 1',
      parentBlockId: 'RadioQuestion1',
      parentOrder: 0,
      action: null,
      children: []
    },
    {
      __typename: 'RadioOptionBlock',
      id: 'RadioOption2',
      label: 'Option 2',
      parentBlockId: 'RadioQuestion1',
      parentOrder: 1,
      action: null,
      children: []
    }
  ]
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
  backdropBlur: null,
  children: [image, typography, button1, radioQuestionBlock]
}

describe('getCardMetadata', () => {
  it('should return card metadata', () => {
    const cardMetadata = getCardMetadata(card)
    expect(cardMetadata).toEqual({
      title: 'title content',
      subtitle: undefined,
      bgImage: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
      priorityImage: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
      priorityBlock: button1,
      hasMultipleActions: true
    })
  })

  it('should return card metadata from internal videoblock', () => {
    const videoCard = {
      ...card,
      children: [video, image, typography]
    }
    const cardMetadata = getCardMetadata(videoCard)
    expect(cardMetadata).toEqual({
      description: 'English',
      title: 'FallingPlates',
      subtitle: '0:00-3:20',
      bgImage:
        'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
      priorityBlock: video,
      hasMultipleActions: false
    })
  })

  it('should have image title and subtitle in metadata when image is only child on card', () => {
    const imageCard = {
      ...card,
      coverBlockId: null,
      children: [image]
    }
    const cardMetadata = getCardMetadata(imageCard)
    expect(cardMetadata).toEqual({
      title: 'Image',
      subtitle: `${image.width} x ${image.height} pixels`,
      bgImage: undefined,
      priorityImage: image.src,
      priorityBlock: image,
      hasMultipleActions: false
    })
  })
})
