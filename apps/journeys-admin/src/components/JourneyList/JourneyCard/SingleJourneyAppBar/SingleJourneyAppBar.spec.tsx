import { render } from '@testing-library/react'
import SingleJourneyAppBar from '.'

describe('SingleJourneyAppBar', () => {
  it('AppBar back button should link to journeys', () => {
    const { getByRole } = render(<SingleJourneyAppBar />)
    expect(getByRole('link').getAttribute('href')).toEqual('/journeys')
  })
})
