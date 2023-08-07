import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { USER_JOURNEY_REQUEST } from './JourneyInvite'

import { JourneyInvite } from '.'

describe('JourneyInvite', () => {
  it('should render request invite an allow user to request invite', async () => {
    const { getAllByRole, getAllByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_JOURNEY_REQUEST,
              variables: {
                journeyId: 'journeyId'
              }
            },
            result: {
              data: {
                userJourneyRequest: {
                  __typename: 'UserJourney',
                  id: 'userJourneyId'
                }
              }
            }
          }
        ]}
      >
        <JourneyInvite journeyId="journeyId" />
      </MockedProvider>
    )
    expect(getAllByText("You can't edit this journey")).toHaveLength(2)
    fireEvent.click(getAllByRole('button', { name: 'Request Now' })[0])
    await waitFor(() => expect(getAllByText('Request Sent')).toHaveLength(2))
  })
})
