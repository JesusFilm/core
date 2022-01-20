import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { USER_JOURNEY_REQUEST } from './JourneyInvite'
import { JourneyInvite } from '.'

describe('JourneyInvite', () => {
  it('should render request invite an allow user to request invite', () => {
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_JOURNEY_REQUEST,
              variables: {
                journeyId: 'journeySlug'
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
        <JourneyInvite journeySlug="journeySlug" />
      </MockedProvider>
    )
    expect(getByText('You need access')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Request Access' }))
    expect(getByText('Request sent')).toBeInTheDocument()
  })

  it('should render invite request received', () => {
    const { getByText, queryByRole } = render(
      <JourneyInvite journeySlug="journeySlug" requestReceived />
    )
    expect(
      queryByRole('button', { name: 'Request Access' })
    ).not.toBeInTheDocument()
    expect(getByText('Request sent')).toBeInTheDocument()
  })
})
