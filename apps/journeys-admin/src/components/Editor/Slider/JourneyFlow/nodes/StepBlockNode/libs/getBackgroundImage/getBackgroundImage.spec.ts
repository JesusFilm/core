import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

import { getBackgroundImage } from '.'

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

const image: TreeBlock<ImageBlock> = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: card.id,
  parentOrder: 0,
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
  endAt: null,
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
  posterBlockId: null,
  children: []
}

const youtubeVideo: TreeBlock<VideoBlock> = {
  ...video,
  source: VideoBlockSource.youTube,
  image: 'https://youtube-image.com',
  mediaVideo: {
    __typename: 'YouTube',
    id: video.id
  }
}

describe('getBackgroundImage', () => {
  describe('ImageBlock', () => {
    it('should return background image', () => {
      const imageCoverBlock: TreeBlock<CardBlock> = {
        ...card,
        coverBlockId: image.id,
        children: [image]
      }
      const backgroundImage = getBackgroundImage(imageCoverBlock)
      expect(backgroundImage).toBe(
        'https://imagedelivery.net/cloudflare-key/uploadId/public'
      )
    })
  })

  describe('VideoBlock', () => {
    it('should return image block as background image', () => {
      const videoCoverBlock: TreeBlock<CardBlock> = {
        ...card,
        coverBlockId: video.id,
        children: [
          {
            ...video,
            posterBlockId: image.id,
            children: [image]
          }
        ]
      }
      const backgroundImage = getBackgroundImage(videoCoverBlock)
      expect(backgroundImage).toBe(
        'https://imagedelivery.net/cloudflare-key/uploadId/public'
      )
    })

    it('should return image from video as background image', () => {
      const videoCoverBlock: TreeBlock<CardBlock> = {
        ...card,
        coverBlockId: video.id,
        children: [video]
      }
      const backgroundImage = getBackgroundImage(videoCoverBlock)
      expect(backgroundImage).toBe(
        'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      )
    })

    it('should return youtube background image', () => {
      const youtubeCoverBlock: TreeBlock<CardBlock> = {
        ...card,
        coverBlockId: youtubeVideo.id,
        children: [youtubeVideo]
      }
      const backgroundImage = getBackgroundImage(youtubeCoverBlock)
      expect(backgroundImage).toBe('https://youtube-image.com')
    })
  })
})
