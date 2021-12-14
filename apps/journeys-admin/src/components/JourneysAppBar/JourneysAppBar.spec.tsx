import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { defaultJourney } from '../SingleJourney/singleJourneyData'
import JourneysAppBar from '.'

describe('JourneysAppBar', () => {
  it('should navigate back to journeys', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <JourneysAppBar journey={defaultJourney} />
      </MockedProvider>
    )
    expect(getByRole('link').getAttribute('href')).toEqual('/journeys')
  })
})
