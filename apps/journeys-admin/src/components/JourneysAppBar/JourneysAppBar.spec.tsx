import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { JourneysAppBar } from './JourneysAppBar'
import { defaultJourney } from '../JourneyView/data'
import { JourneyProvider } from '../JourneyView/Context'

describe('JourneysAppBar', () => {
  it('should navigate back to journeys', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <JourneyProvider value={defaultJourney}>
          <JourneysAppBar variant="view" />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('link').getAttribute('href')).toEqual('/journeys')
  })
})
