import { ApproveUser, USER_JOURNEY_APPROVE } from './ApproveUser'
import { renderWithApolloClient } from '../../../../test/testingLibrary'
import { GetJourney_journey_usersJourneys as UserJourney } from '../../../../__generated__/GetJourney'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'
import { MockedProvider } from '@apollo/client/testing'

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

describe('Approve button', () => {
  it('should hanlde onClick', () => {
    const { getByText } = renderWithApolloClient(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_JOURNEY_APPROVE,
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
        <ApproveUser usersJourneys={userJourney} />
      </MockedProvider>
    )
    expect(getByText('Approve')).toBeInTheDocument()
  })
})
