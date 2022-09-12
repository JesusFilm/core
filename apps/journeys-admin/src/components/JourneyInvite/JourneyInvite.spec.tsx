import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { USER_JOURNEY_REQUEST } from './JourneyInvite'
import { JourneyInvite } from '.'

describe('JourneyInvite', () => {
  it('should render request invite an allow user to request invite', async () => {
    const { getByRole, getByText } = render(
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
    expect(getByText('You need access')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Request Access' }))
    await waitFor(() => expect(getByText('Request sent')).toBeInTheDocument())
  })

  it('should render invite request received', () => {
    const { getByText, queryByRole, getByRole } = render(
      <MockedProvider mocks={[]}>
        <JourneyInvite journeyId="journeyId" requestReceived />
      </MockedProvider>
    )
    expect(
      queryByRole('button', { name: 'Request Access' })
    ).not.toBeInTheDocument()
    expect(getByText('Request sent')).toBeInTheDocument()
    expect(
      getByRole('link', { name: 'Back to the Admin Panel' })
    ).toHaveAttribute('href', '/')
  })
})
