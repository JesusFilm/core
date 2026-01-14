import { GetAdminJourneys_journeys as ActiveJourney } from '../../../../../__generated__/GetAdminJourneys'
import { SortOrder } from '../JourneySort'

import { sortJourneys } from './sortJourneys'
import { getRecentlyOpenedJourney } from './trackRecentlyOpenedJourney'

jest.mock('./trackRecentlyOpenedJourney', () => ({
  getRecentlyOpenedJourney: jest.fn()
}))

describe('sortJourneys', () => {
  beforeEach(() => {
    ;(getRecentlyOpenedJourney as jest.Mock).mockReturnValue(null)
  })

  it('should return journeys sorted by updatedAt date by default', () => {
    const journeys = [
      {
        updatedAt: '2021-11-23T18:05:25.789Z'
      } as unknown as ActiveJourney,
      {
        updatedAt: '2021-11-21T08:45:00.000Z'
      } as unknown as ActiveJourney,
      {
        updatedAt: '2021-11-19T12:34:56.647Z'
      } as unknown as ActiveJourney,
      {
        updatedAt: '2021-11-20T10:15:30.123Z'
      } as unknown as ActiveJourney,
      {
        updatedAt: '2021-11-22T14:20:10.456Z'
      } as unknown as ActiveJourney
    ]
    const sorted = sortJourneys(journeys)
    expect(sorted).toEqual([
      {
        updatedAt: '2021-11-23T18:05:25.789Z'
      } as unknown as ActiveJourney,
      {
        updatedAt: '2021-11-22T14:20:10.456Z'
      } as unknown as ActiveJourney,
      {
        updatedAt: '2021-11-21T08:45:00.000Z'
      } as unknown as ActiveJourney,
      {
        updatedAt: '2021-11-20T10:15:30.123Z'
      } as unknown as ActiveJourney,
      {
        updatedAt: '2021-11-19T12:34:56.647Z'
      } as unknown as ActiveJourney
    ])
  })

  it('should return journeys sorted by creation date', () => {
    const journeys = [
      {
        createdAt: '2021-11-21T08:45:00.000Z'
      } as unknown as ActiveJourney,
      {
        createdAt: '2021-11-19T12:34:56.647Z'
      } as unknown as ActiveJourney,
      {
        createdAt: '2021-11-20T10:15:30.123Z'
      } as unknown as ActiveJourney,
      {
        createdAt: '2021-11-23T18:05:25.789Z'
      } as unknown as ActiveJourney,
      {
        createdAt: '2021-11-22T14:20:10.456Z'
      } as unknown as ActiveJourney
    ]

    const sorted = sortJourneys(journeys, SortOrder.CREATED_AT)

    expect(sorted).toEqual([
      {
        createdAt: '2021-11-23T18:05:25.789Z'
      } as unknown as ActiveJourney,
      {
        createdAt: '2021-11-22T14:20:10.456Z'
      } as unknown as ActiveJourney,
      {
        createdAt: '2021-11-21T08:45:00.000Z'
      } as unknown as ActiveJourney,
      {
        createdAt: '2021-11-20T10:15:30.123Z'
      } as unknown as ActiveJourney,
      {
        createdAt: '2021-11-19T12:34:56.647Z'
      } as unknown as ActiveJourney
    ])
  })

  it('should return journeys sorted by alphabetical order ignoring special characters', () => {
    const journeys = [
      {
        title: 'Z'
      } as unknown as ActiveJourney,
      {
        title: '(xyz'
      } as unknown as ActiveJourney,
      {
        title: 'aA'
      } as unknown as ActiveJourney,
      {
        title: '#aBc'
      } as unknown as ActiveJourney,
      {
        title: 'AB'
      } as unknown as ActiveJourney
    ]

    const sorted = sortJourneys(journeys, SortOrder.TITLE)
    expect(sorted).toEqual([
      {
        title: 'aA'
      } as unknown as ActiveJourney,
      {
        title: 'AB'
      } as unknown as ActiveJourney,
      {
        title: '#aBc'
      } as unknown as ActiveJourney,
      {
        title: '(xyz'
      } as unknown as ActiveJourney,
      {
        title: 'Z'
      } as unknown as ActiveJourney
    ])
  })

  it('should place recently opened journey first', () => {
    const journeys = [
      {
        id: 'journey-1',
        updatedAt: '2021-11-20T10:15:30.123Z',
        title: 'B'
      } as unknown as ActiveJourney,
      {
        id: 'journey-2',
        updatedAt: '2021-11-23T18:05:25.789Z',
        title: 'A'
      } as unknown as ActiveJourney,
      {
        id: 'journey-3',
        updatedAt: '2021-11-21T08:45:00.000Z',
        title: 'C'
      } as unknown as ActiveJourney
    ]

    ;(getRecentlyOpenedJourney as jest.Mock).mockReturnValue({
      journeyId: 'journey-3',
      openedAt: 1700000000000
    })

    const sorted = sortJourneys(journeys, SortOrder.TITLE)

    expect(sorted).toEqual([
      {
        id: 'journey-3',
        updatedAt: '2021-11-21T08:45:00.000Z',
        title: 'C'
      } as unknown as ActiveJourney,
      {
        id: 'journey-2',
        updatedAt: '2021-11-23T18:05:25.789Z',
        title: 'A'
      } as unknown as ActiveJourney,
      {
        id: 'journey-1',
        updatedAt: '2021-11-20T10:15:30.123Z',
        title: 'B'
      } as unknown as ActiveJourney
    ])
  })
})
