import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourney'

import { showVideosSection } from './showVideosSection'

describe('showVideosSection', () => {
  it('returns false when no card is selected', () => {
    const journey = {
      __typename: 'Journey'
    } as unknown as Journey
    const cardBlockId = null

    expect(showVideosSection(journey, cardBlockId)).toBe(false)
  })

  it('returns false when journey is undefined', () => {
    const journey = undefined
    const cardBlockId = 'card-1'

    expect(showVideosSection(journey, cardBlockId)).toBe(false)
  })

  it('returns false when selected card has no customizable video blocks', () => {
    const journey = {
      blocks: [
        {
          __typename: 'VideoBlock',
          id: 'video-1',
          customizable: true,
          parentBlockId: 'other-card-id'
        }
      ]
    } as unknown as Journey

    expect(showVideosSection(journey, 'card-1')).toBe(false)
  })

  it('returns true when selected card has a customizable video block', () => {
    const videoBlock = {
      __typename: 'VideoBlock',
      id: 'video-1',
      customizable: true,
      parentBlockId: 'card-1'
    } as unknown as VideoBlock

    const journey = {
      blocks: [videoBlock]
    } as unknown as Journey

    expect(showVideosSection(journey, 'card-1')).toBe(true)
  })
})
