import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'

import { getCustomizableImageBlocks } from './getCustomizableImageBlocks'

describe('getCustomizableImageBlocks', () => {
  const cardBlockId = 'cardId'
  const imageBlock: ImageBlock = {
    __typename: 'ImageBlock',
    id: 'imageId',
    parentBlockId: cardBlockId,
    customizable: true,
    src: 'https://example.com/image.jpg',
    alt: 'image alt',
    width: 100,
    height: 100,
    blurhash: 'blurhash',
    parentOrder: 0,
    scale: null,
    focalTop: null,
    focalLeft: null
  }

  it('should return empty array if journey is null', () => {
    expect(getCustomizableImageBlocks(null, cardBlockId)).toEqual([])
  })

  it('should return empty array if cardBlockId is null', () => {
    expect(getCustomizableImageBlocks({} as Journey, null)).toEqual([])
  })

  it('should return customizable image blocks for the given card', () => {
    const journey = {
      blocks: [
        imageBlock,
        { ...imageBlock, id: 'otherImageId', parentBlockId: 'otherCardId' },
        { ...imageBlock, id: 'notCustomizable', customizable: false },
        {
          __typename: 'VideoBlock',
          id: 'videoId',
          parentBlockId: cardBlockId,
          customizable: true
        }
      ]
    } as unknown as Journey

    expect(getCustomizableImageBlocks(journey, cardBlockId)).toEqual([
      imageBlock
    ])
  })

  it('should return empty array if no blocks match', () => {
    const journey = {
      blocks: [
        { ...imageBlock, parentBlockId: 'otherCardId' },
        { ...imageBlock, customizable: false }
      ]
    } as unknown as Journey

    expect(getCustomizableImageBlocks(journey, cardBlockId)).toEqual([])
  })

  it('should handle journey with no blocks', () => {
    const journey = { blocks: [] } as unknown as Journey
    expect(getCustomizableImageBlocks(journey, cardBlockId)).toEqual([])
  })
})
