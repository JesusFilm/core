import { InMemoryCache } from '@apollo/client'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_ImageBlock as ImageBlock } from '@core/journeys/ui/block/__generated__/BlockFields'

import { blockCreateUpdate } from './blockCreateUpdate'

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
  children: [],
  scale: null,
  focalLeft: 50,
  focalTop: 50
}

const response = { ...image, parentOrder: 0 }

describe('blockCreateUpdate', () => {
  it('should perform block create logic', () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: 'CardBlock:cardId' },
          { __ref: 'VideoBlock:videoId' }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'CardBlock:cardId': { __typename: 'CardBlock', id: 'cardId' },
      'VideoBlock:videoId': { __typename: 'VideoBlock', id: 'videoId' }
    })
    expect(cache.extract()['ImageBlock:imageId']).toBeUndefined()
    blockCreateUpdate(cache, 'journeyId', response)
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'CardBlock:cardId' },
      { __ref: 'VideoBlock:videoId' },
      { __ref: 'ImageBlock:imageId' }
    ])
    expect(cache.extract()['ImageBlock:imageId']).toEqual({
      __typename: 'ImageBlock',
      id: 'imageId'
    })
  })
})
