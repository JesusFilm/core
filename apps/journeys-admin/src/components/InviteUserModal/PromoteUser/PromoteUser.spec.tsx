import { PromoteUser, USER_JOURNEY_PROMOTE } from './PromoteUser'
import { GetJourney_journey_usersJourneys as UserJourney } from '../../../../__generated__/GetJourney'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'
import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

const userJourney: UserJourney = {
  __typename: 'UserJourney',
  userId: '1',
  journeyId: '1234',
  role: UserJourneyRole.inviteRequested,
  user: {
    __typename: 'User',
    id: '1',
    email: 'drew@drew.com',
    firstName: 'drew',
    lastName: 'drew',
    imageUrl: ''
  }
}

describe('Promote button', () => {
  it('should render promote button', () => {
    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_JOURNEY_PROMOTE,
              variables: {
                input: {
                  userId: '1',
                  journeyId: '1234'
                }
              }
            },
            result: {
              data: {
                userJourneyApprove: {
                  __typename: 'UserJourney',
                  userId: '1',
                  journeyId: '1234'
                }
              }
            }
          }
        ]}
      >
        <PromoteUser usersJourneys={userJourney} />
      </MockedProvider>
    )
    expect(getByText('Promote')).toBeInTheDocument()
  })
})
