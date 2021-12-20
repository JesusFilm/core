import { render } from '@testing-library/react'
import { defaultJourney } from '../SingleJourney/SingleJourneyData'
import { JourneysAppBar } from '.'

describe('JourneysAppBar', () => {
  it('should navigate back to journeys', () => {
    const { getByRole } = render(<JourneysAppBar journey={defaultJourney} />)
    expect(getByRole('link').getAttribute('href')).toEqual('/journeys')
  })
})
