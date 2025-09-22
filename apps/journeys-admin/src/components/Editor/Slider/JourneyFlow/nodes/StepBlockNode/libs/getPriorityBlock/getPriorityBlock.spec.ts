import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_IconBlock as IconBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_RadioQuestionBlock as RadioQuestionBlock,
  BlockFields_SignUpBlock as SignUpBlock,
  BlockFields_TextResponseBlock as TextResponseBlock,
  BlockFields_TypographyBlock as TypographyBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

import { getPriorityBlock } from '.'

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
  backdropBlur: null,
  children: []
}

const button: TreeBlock<ButtonBlock> = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  parentOrder: 0,
  label: 'This is a button',
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

const radioQuestion: TreeBlock<RadioQuestionBlock> = {
  __typename: 'RadioQuestionBlock',
  id: 'RadioQuestion1',
  parentBlockId: 'RadioQuestion1',
  parentOrder: 0,
  gridView: false,
  children: []
}

const signUp: TreeBlock<SignUpBlock> = {
  __typename: 'SignUpBlock',
  id: 'signUp0.id',
  parentBlockId: '0',
  parentOrder: 0,
  submitIconId: null,
  submitLabel: null,
  action: null,
  children: []
}

const textResponse: TreeBlock<TextResponseBlock> = {
  __typename: 'TextResponseBlock',
  id: 'textResponse0.id',
  parentBlockId: '0',
  parentOrder: 0,
  label: 'Your answer here',
  placeholder: null,
  hint: null,
  minRows: null,
  integrationId: null,
  type: null,
  routeId: null,
  required: null,
  children: [],
  hideLabel: true
}

const typography: TreeBlock<TypographyBlock> = {
  __typename: 'TypographyBlock',
  id: 'heading3',
  parentBlockId: 'question',
  parentOrder: 0,
  content: 'Hello World!',
  variant: null,
  color: null,
  align: null,
  children: [],
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}

const video: TreeBlock<VideoBlock> = {
  __typename: 'VideoBlock',
  id: 'video0.id',
  parentBlockId: '',
  parentOrder: 0,
  autoplay: false,
  startAt: 10,
  endAt: null,
  muted: null,
  posterBlockId: 'posterBlockId',
  fullsize: null,
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
    __typename: 'Video',
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
    variantLanguages: []
  },
  children: []
}

const icon = {
  __typename: 'IconBlock',
  id: 'icon0.id',
  children: []
} as unknown as TreeBlock<IconBlock>

const blocks = [
  video,
  textResponse,
  button,
  radioQuestion,
  signUp,
  typography,
  image
]

describe('getPriorityBlock', () => {
  it('should return video block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: blocks
    })
    expect(priorityBlock).toEqual(video)
  })

  it('should return text response block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: blocks.slice(1)
    })
    expect(priorityBlock).toEqual(textResponse)
  })

  it('should return button block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: blocks.slice(2)
    })
    expect(priorityBlock).toEqual(button)
  })

  it('should return radio question block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: blocks.slice(3)
    })
    expect(priorityBlock).toEqual(radioQuestion)
  })

  it('should return signup block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: blocks.slice(4)
    })
    expect(priorityBlock).toEqual(signUp)
  })

  it('should return typography block as priority', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: blocks.slice(5)
    })
    expect(priorityBlock).toEqual(typography)
  })

  it('should return default block', () => {
    const priorityBlock = getPriorityBlock({
      ...card,
      children: [icon]
    })

    expect(priorityBlock).toEqual(icon)
  })
})
