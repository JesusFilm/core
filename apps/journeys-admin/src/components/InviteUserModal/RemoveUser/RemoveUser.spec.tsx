import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { GetJourney_adminJourney_userJourneys as UserJourney } from '../../../../__generated__/GetJourney'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'
import { RemoveUser, USER_JOURNEY_REMOVE } from './RemoveUser'

const userJourney: UserJourney = {
  id: '1234',
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
              query: USER_JOURNEY_REMOVE,
              variables: {
                input: {
                  userId: '1',
                  journeyId: '1234',
                  role: UserJourneyRole.inviteRequested
                }
              }
            },
            result: {
              data: {
                userJourneyApprove: {
                  __typename: 'UserJourney',
                  userId: '1',
                  journeyId: '1234',
                  role: UserJourneyRole.inviteRequested
                }
              }
            }
          }
        ]}
      >
        <RemoveUser userJourney={userJourney} />
      </MockedProvider>
    )
    expect(getByText('Remove')).toBeInTheDocument()
  })
})
