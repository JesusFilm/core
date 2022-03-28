import { InMemoryCache } from '@apollo/client'
import { TreeBlock } from '@core/journeys/ui'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
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
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  video: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
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
  children: [video, image]
}

const journey: Journey = {
  __typename: 'Journey',
  id: 'journeyId',
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  title: 'my journey',
  slug: 'my-journey',
  locale: 'en-US',
  description: 'my cool journey',
  status: JourneyStatus.draft,
  createdAt: '2021-11-19T12:34:56.647Z',
  publishedAt: null,
  blocks: [] as TreeBlock[],
  primaryImageBlock: null,
  userJourneys: []
}

const response = [{ ...image, parentOrder: 0 }]

describe('blockDeleteUpdate', () => {
  it('should perform block delete logic', () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:JourneyId': {
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
    expect(cache.extract()['Journey:JourneyId']?.blocks).toEqual([
      { __ref: 'CardBlock:cardId' },
      { __ref: 'ImageBlock:imageId' }
    ])
    expect(cache.extract()['VideoBlock:videoId']).toBeUndefined()
    expect(cache.extract()['ImageBlock:ImageId']?.parentOrder).toEqual(0)
  })
})
