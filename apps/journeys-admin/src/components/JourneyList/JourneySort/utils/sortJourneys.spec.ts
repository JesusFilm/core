import { GetJourneysAdmin_journeys as ActiveJourney } from '../../../../../__generated__/GetJourneysAdmin'
import { defaultJourney, oldJourney } from '../../journeyListData'
import { SortOrder } from '../JourneySort'

import { sortJourneys } from './sortJourneys'

describe('sortJourneys', () => {
  it('should return journeys sorted by creation date by default', () => {
    const sorted = sortJourneys([oldJourney, defaultJourney])
    expect(sorted).toEqual([defaultJourney, oldJourney])
  })

  it('should return journeys sorted by creation date', () => {
    const sorted = sortJourneys(
      [oldJourney, defaultJourney],
      SortOrder.CREATED_AT
    )
    expect(sorted).toEqual([defaultJourney, oldJourney])
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
})
