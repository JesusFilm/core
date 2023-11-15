import { InMemoryCache } from '@apollo/client'

import type { TreeBlock } from '@core/journeys/ui/block'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../__generated__/globalTypes'

import { blockDeleteUpdate } from './blockDeleteUpdate'

const video: TreeBlock<VideoBlock> = {
  id: 'videoId',
  __typename: 'VideoBlock',
  parentBlockId: 'cardId',
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

const image: TreeBlock<ImageBlock> = {
  id: 'imageId',
  __typename: 'ImageBlock',
  parentBlockId: 'card1.id',
  parentOrder: 1,
  src: 'image.src',
  alt: 'image.alt',
  blurhash: '',
  width: 10,
  height: 10,
  children: []
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  featuredAt: null,
  strategySlug: null,
  title: 'my journey',
  slug: 'my-journey',
  language: {
    __typename: 'Language',
    id: '529',
    bcp47: 'en',
    iso3: 'eng',
    name: [
      {
        __typename: 'Translation',
        value: 'English',
        primary: true
      }
    ]
  },
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  template: null,
  userJourneys: [],
  seoTitle: null,
  seoDescription: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: []
}

const response = [{ ...image, parentOrder: 0 }]

describe('blockDeleteUpdate', () => {
  it('should perform block delete logic', () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: 'CardBlock:cardId' },
          { __ref: 'VideoBlock:videoId' },
          { __ref: 'ImageBlock:imageId' }
        ],
        id: journey.id,
        __typename: 'Journey'
      },
      'VideoBlock:videoId': { ...video },
      'ImageBlock:imageId': { ...image }
    })
    blockDeleteUpdate(video, response, cache, journey.id)
    const extractedCache = cache.extract()
    expect(extractedCache['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'CardBlock:cardId' },
      { __ref: 'ImageBlock:imageId' }
    ])
    expect(extractedCache['VideoBlock:videoId']).toBeUndefined()
    expect(extractedCache['ImageBlock:imageId']?.parentOrder).toBe(0)
  })
})
