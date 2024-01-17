import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { AccessDenied, USER_JOURNEY_REQUEST } from './AccessDenied'

// mock router
jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
  // () => ({ query: { tab: 'active' } }))
}))

describe('AccessDenied', () => {
  it('should request access', async () => {
    // define the request access mock
    const mocks = {
      request: {
        query: USER_JOURNEY_REQUEST,
        variables: { journeyId: 'mockedJourneyId' }
      }
    }

    // pass the mock into mocked provider
    const { getAllByRole } = render(
      <MockedProvider mocks={[mocks]}>
        <AccessDenied />
      </MockedProvider>
    )

    // fire click - already happening
    fireEvent.click(getAllByRole('button', { name: 'Request Now' })[0])

    // await waitFor expect result to have been called
    await waitFor(() =>
      expect(mocks[0].result.data.userJourneyRequest.id).toBeTruthy()
    )

    // expect text and icon to change
    expect(
      getAllByRole('button', { name: 'Request Now' })[0]
    ).toHaveTextContent('Request Sent')
  })

  it('should show back button', () => {
    const { getByRole } = render(
      <MockedProvider>
        <AccessDenied />
      </MockedProvider>
    )

    expect(getByRole('link', { name: 'Back to my journeys' })).toHaveAttribute(
      'href',
      '/'
    )
  })
})
