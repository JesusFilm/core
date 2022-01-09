import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { JourneysAppBar } from './JourneysAppBar'

describe('JourneysAppBar', () => {
  it('should navigate back to journeys', () => {
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <JourneysAppBar variant="view" />
      </MockedProvider>
    )
    expect(getByRole('link').getAttribute('href')).toEqual('/journeys')
  })
})
