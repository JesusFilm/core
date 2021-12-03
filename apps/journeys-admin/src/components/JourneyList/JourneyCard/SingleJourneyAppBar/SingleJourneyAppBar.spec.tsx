import { render } from '@testing-library/react'
import SingleJourneyAppBar from '.'

describe('SingleJourneyAppBar', () => {
  it('should navigate back to journeys', () => {
    const { getByRole } = render(<SingleJourneyAppBar />)
    expect(getByRole('link').getAttribute('href')).toEqual('/journeys')
  })
})
