import { GetJourney_journey as Journey } from '../../../../../__generated__/GetJourney'

import { getJourneyMedia } from './getJourneyMedia'

describe('getJourneyMedia', () => {
  it('should return an empty array if no journey is provided', () => {
    expect(getJourneyMedia(undefined)).toEqual([])
  })

  it('should return empty array if journey has no blocks', () => {
    const journey = { blocks: [] } as unknown as Journey
    expect(getJourneyMedia(journey)).toEqual([])
  })

  it('should extract customizable logo block', () => {
    const journey = {
      logoImageBlock: {
        __typename: 'ImageBlock',
        customizable: true,
        id: 'logo-1'
      },
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: 'btn-1',
          label: 'Hi {{firstName}}',
          action: {
            __typename: 'LinkAction',
            url: 'https://example.com',
            customizable: true,
            parentStepId: 'step-1'
          }
        }
      ]
    } as unknown as Journey
    expect(getJourneyMedia(journey)).toEqual([
      { __typename: 'ImageBlock', id: 'logo-1', customizable: true }
    ])
  })

  it('should extract customizable image blocks', () => {
    const journey = {
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: 'btn-1',
          label: 'Hi {{firstName}}',
          action: {
            __typename: 'LinkAction',
            url: 'https://example.com',
            customizable: true,
            parentStepId: 'step-1'
          }
        },
        { __typename: 'ImageBlock', id: 'img-1', customizable: true }
      ]
    } as unknown as Journey
    expect(getJourneyMedia(journey)).toEqual([
      { __typename: 'ImageBlock', id: 'img-1', customizable: true }
    ])
  })

  it('should extract customizable video blocks', () => {
    const journey = {
      blocks: [
        {
          __typename: 'ButtonBlock',
          id: 'btn-1',
          label: 'Hi {{firstName}}',
          action: {
            __typename: 'LinkAction',
            url: 'https://example.com',
            customizable: true,
            parentStepId: 'step-1'
          }
        },
        { __typename: 'VideoBlock', id: 'vid-1', customizable: true }
      ]
    } as unknown as Journey
    expect(getJourneyMedia(journey)).toEqual([
      { __typename: 'VideoBlock', id: 'vid-1', customizable: true }
    ])
  })
})
