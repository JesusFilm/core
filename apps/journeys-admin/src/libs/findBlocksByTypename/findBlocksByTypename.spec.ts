import type { TreeBlock } from '@core/journeys/ui/block'
import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_StepBlock as StepBlock,
  BlockFields_VideoBlock as VideoBlock
} from '@core/journeys/ui/block/__generated__/BlockFields'

import {
  ButtonSize,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../__generated__/globalTypes'

import { findBlocksByTypename } from './findBlocksByTypename'

const videoBlock: TreeBlock<VideoBlock> = {
  id: 'video1',
  __typename: 'VideoBlock',
  parentBlockId: 'card1',
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: true,
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
  subtitleLanguage: null,
  showGeneratedSubtitles: null,
  mediaVideo: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'VideoTitle',
        value: 'FallingPlates'
      }
    ],
    images: [],
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    variantLanguages: []
  },
  posterBlockId: null,
  eventLabel: null,
  endEventLabel: null,
  customizable: null,
  children: []
}

const imageBlock: TreeBlock<ImageBlock> = {
  id: 'image1',
  __typename: 'ImageBlock',
  parentBlockId: 'card1',
  parentOrder: 1,
  src: 'image.src',
  alt: 'image.alt',
  blurhash: '',
  width: 10,
  height: 10,
  children: [],
  scale: null,
  focalLeft: 50,
  focalTop: 50,
  customizable: null
}

const buttonBlock: TreeBlock<ButtonBlock> = {
  id: 'button1',
  __typename: 'ButtonBlock',
  parentBlockId: 'card1',
  parentOrder: 2,
  label: 'Click me',
  buttonVariant: null,
  buttonColor: null,
  size: ButtonSize.medium,
  startIconId: null,
  endIconId: null,
  submitEnabled: null,
  action: null,
  children: [],
  settings: null,
  eventLabel: null
}

const cardBlock: TreeBlock<CardBlock> = {
  id: 'card1',
  __typename: 'CardBlock',
  parentBlockId: 'step1',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: ThemeMode.light,
  themeName: ThemeName.base,
  fullscreen: false,
  backdropBlur: null,
  eventLabel: null,
  children: [videoBlock, imageBlock, buttonBlock]
}

const stepBlock: TreeBlock<StepBlock> = {
  id: 'step1',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: 0,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: [cardBlock]
}

describe('findBlocksByTypename', () => {
  it('should find a block at the root level', () => {
    const result = findBlocksByTypename(videoBlock, 'VideoBlock')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('video1')
    expect(result[0].__typename).toBe('VideoBlock')
  })

  it('should find blocks nested in children', () => {
    const result = findBlocksByTypename(cardBlock, 'VideoBlock')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('video1')
    expect(result[0].__typename).toBe('VideoBlock')
  })

  it('should find multiple blocks of the same type', () => {
    const videoBlock2: TreeBlock<VideoBlock> = {
      ...videoBlock,
      id: 'video2',
      parentOrder: 1
    }
    const cardWithMultipleVideos: TreeBlock<CardBlock> = {
      ...cardBlock,
      children: [videoBlock, videoBlock2, imageBlock]
    }

    const result = findBlocksByTypename(cardWithMultipleVideos, 'VideoBlock')
    expect(result).toHaveLength(2)
    expect(result.map((b) => b.id)).toEqual(['video1', 'video2'])
  })

  it('should find blocks deeply nested in multiple levels', () => {
    const result = findBlocksByTypename(stepBlock, 'VideoBlock')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('video1')
  })

  it('should return empty array when no blocks of the type exist', () => {
    const result = findBlocksByTypename(imageBlock, 'VideoBlock')
    expect(result).toHaveLength(0)
  })

  it('should find different block types', () => {
    const imageResult = findBlocksByTypename(cardBlock, 'ImageBlock')
    expect(imageResult).toHaveLength(1)
    expect(imageResult[0].id).toBe('image1')
    expect(imageResult[0].__typename).toBe('ImageBlock')

    const buttonResult = findBlocksByTypename(cardBlock, 'ButtonBlock')
    expect(buttonResult).toHaveLength(1)
    expect(buttonResult[0].id).toBe('button1')
    expect(buttonResult[0].__typename).toBe('ButtonBlock')
  })

  it('should handle blocks with no children', () => {
    const result = findBlocksByTypename(videoBlock, 'VideoBlock')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('video1')
  })

  it('should handle blocks with empty children array', () => {
    const blockWithEmptyChildren: TreeBlock<VideoBlock> = {
      ...videoBlock,
      children: []
    }
    const result = findBlocksByTypename(blockWithEmptyChildren, 'VideoBlock')
    expect(result).toHaveLength(1)
  })

  it('should handle blocks with null children', () => {
    const blockWithNullChildren: TreeBlock<VideoBlock> = {
      ...videoBlock,
      children: null as unknown as TreeBlock[]
    }
    const result = findBlocksByTypename(blockWithNullChildren, 'VideoBlock')
    expect(result).toHaveLength(1)
  })

  it('should find all block types in a complex tree', () => {
    const videoResult = findBlocksByTypename(stepBlock, 'VideoBlock')
    const imageResult = findBlocksByTypename(stepBlock, 'ImageBlock')
    const buttonResult = findBlocksByTypename(stepBlock, 'ButtonBlock')
    const cardResult = findBlocksByTypename(stepBlock, 'CardBlock')
    const stepResult = findBlocksByTypename(stepBlock, 'StepBlock')

    expect(videoResult).toHaveLength(1)
    expect(imageResult).toHaveLength(1)
    expect(buttonResult).toHaveLength(1)
    expect(cardResult).toHaveLength(1)
    expect(stepResult).toHaveLength(1)
  })

  it('should not find blocks with different typename', () => {
    const result = findBlocksByTypename(videoBlock, 'ImageBlock')
    expect(result).toHaveLength(0)
  })

  it('should return typed blocks', () => {
    const result = findBlocksByTypename(cardBlock, 'VideoBlock')
    expect(result[0]).toHaveProperty('videoId')
    expect(result[0]).toHaveProperty('source')
    expect(result[0].__typename).toBe('VideoBlock')
  })
})
