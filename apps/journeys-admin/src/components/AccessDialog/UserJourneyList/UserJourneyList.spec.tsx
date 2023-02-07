import { render } from '@testing-library/react'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'
import { GetJourneyWithUserJourneys_journey_userJourneys as UserJourney } from '../../../../__generated__/GetJourneyWithUserJourneys'
import { UserJourneyList } from '.'

describe('UserJourneyList', () => {
  it('should display title and list of users', () => {
    const userJourneys: UserJourney[] = [
      {
        id: 'userJourney1.id',
        __typename: 'UserJourney',
        role: UserJourneyRole.owner,
        user: {
          __typename: 'User',
          id: 'user1.id',
          firstName: 'firstName1',
          lastName: 'lastName1',
          email: 'name1@email.com',
          imageUrl: null
        }
      },
      {
        id: 'userJourney2.id',
        __typename: 'UserJourney',
        role: UserJourneyRole.editor,
        user: {
          __typename: 'User',
          id: 'user2.id',
          firstName: 'firstName2',
          lastName: 'lastName2',
          email: 'name2@email.com',
          imageUrl: null
        }
      }
    ]
    const { getAllByRole, getByText } = render(
      <UserJourneyList
        title="Users With Access"
        userJourneys={userJourneys}
        disable={false}
      />
    )
    expect(getByText('Users With Access')).toBeInTheDocument()
    expect(getAllByRole('listitem')).toHaveLength(2)
  })
})
