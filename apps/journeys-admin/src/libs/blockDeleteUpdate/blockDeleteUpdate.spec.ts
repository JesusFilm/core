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
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  title: 'watch',
  startAt: 0,
  endAt: null,
  muted: true,
  autoplay: true,
  fullsize: true,
  videoContent: {
    __typename: 'VideoGeneric',
    src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  posterBlockId: null,
  children: []
}

const image: TreeBlock<ImageBlock> = {
  id: 'image1.id',
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
  id: 'card1.id',
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
      ['Journey:' + journey.id]: {
        blocks: [
          { __ref: `CardBlock:${card.id}` },
          { __ref: `VideoBlock:${video.id}` },
          { __ref: `ImageBlock:${image.id}` }
        ],
        id: journey.id,
        __typename: 'Journey'
      },
      ['VideoBlock:' + video.id]: {
        ...video
      },
      ['ImageBlock:' + image.id]: { ...image }
    })
    blockDeleteUpdate(video, response, cache, journey.id)
    expect(cache.extract()[`Journey:${journey.id}`]?.blocks).toEqual([
      { __ref: `CardBlock:${card.id}` },
      { __ref: `ImageBlock:${image.id}` }
    ])
    expect(cache.extract()['VideoBlock:' + video.id]).toBeUndefined()
    expect(cache.extract()['ImageBlock:' + image.id]?.parentOrder).toEqual(0)
  })
})
