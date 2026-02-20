import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'

import { showImagesSection } from './showImagesSection'

describe('showImagesSection', () => {
  const journey = {
    id: 'journey.id',
    blocks: [
      {
        id: 'image1.id',
        __typename: 'ImageBlock',
        parentBlockId: 'card1.id',
        customizable: true
      },
      {
        id: 'image2.id',
        __typename: 'ImageBlock',
        parentBlockId: 'card1.id',
        customizable: false
      },
      {
        id: 'image3.id',
        __typename: 'ImageBlock',
        parentBlockId: 'card2.id',
        customizable: true
      }
    ]
  } as unknown as Journey

  it('returns false when journey is undefined', () => {
    expect(showImagesSection(undefined, 'card1.id')).toBe(false)
  })

  it('returns false when cardBlockId is null', () => {
    expect(showImagesSection(journey, null)).toBe(false)
  })

  it('returns true when there is at least one customizable ImageBlock for the card', () => {
    expect(showImagesSection(journey, 'card1.id')).toBe(true)
  })

  it('returns false when there are only non-customizable images for the card', () => {
    const nonCustomizableJourney = {
      ...journey,
      blocks: [journey.blocks?.[1]]
    } as unknown as Journey
    expect(showImagesSection(nonCustomizableJourney, 'card1.id')).toBe(false)
  })

  it('returns false when there are images for other cards but not the selected card', () => {
    expect(showImagesSection(journey, 'card3.id')).toBe(false)
  })

  it('returns false when there are no image blocks at all', () => {
    const noImagesJourney = {
      ...journey,
      blocks: [{ id: 'video1.id', __typename: 'VideoBlock' }]
    } as unknown as Journey
    expect(showImagesSection(noImagesJourney, 'card1.id')).toBe(false)
  })
})
