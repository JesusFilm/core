import { render } from '@testing-library/react'
import JourneysAppBar from '.'
import { defaultJourney } from '../JourneyList/journeyListData'

describe('JourneysAppBar', () => {
  it('should navigate back to journeys', () => {
    const { getByRole } = render(<JourneysAppBar journey={defaultJourney} />)
    expect(getByRole('link').getAttribute('href')).toEqual('/journeys')
  })
})
