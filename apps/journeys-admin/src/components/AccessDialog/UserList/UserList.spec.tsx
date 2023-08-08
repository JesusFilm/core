import { render } from '@testing-library/react'

import { GetJourneyWithUserJourneys_journey_userJourneys as UserJourney } from '../../../../__generated__/GetJourneyWithUserJourneys'
import { GetUserInvites_userInvites as UserInvite } from '../../../../__generated__/GetUserInvites'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'

import { UserList } from '.'

describe('UserList', () => {
  const userJourney1: UserJourney = {
    id: 'userJourney1.id',
    __typename: 'UserJourney',
    role: UserJourneyRole.editor,
    user: {
      __typename: 'User',
      id: 'user1.id',
      firstName: 'firstName1',
      lastName: 'lastName1',
      email: 'name1@email.com',
      imageUrl: null
    }
  }

  const userJourney2: UserJourney = {
    id: 'userJourney2.id',
    __typename: 'UserJourney',
    role: UserJourneyRole.owner,
    user: {
      __typename: 'User',
      id: 'user2.id',
      firstName: 'firstName2',
      lastName: 'lastName2',
      email: 'name2@email.com',
      imageUrl: null
    }
  }

  const userInvite: UserInvite = {
    id: 'userInvite.id',
    __typename: 'UserInvite',
    journeyId: 'journey.id',
    email: 'invite@email.com',
    acceptedAt: null,
    removedAt: null
  }

  it('should display title and list of users', () => {
    const { getByRole, getAllByRole } = render(
      <UserList
        title="Users with Access"
        users={[userJourney1, userJourney2]}
        invites={[userInvite]}
        currentUser={userJourney1}
        journeyId="journey.id"
      />
    )
    expect(
      getByRole('heading', { name: 'Users with Access' })
    ).toBeInTheDocument()
    expect(getAllByRole('listitem')).toHaveLength(3)
    expect(getAllByRole('listitem')[0]).toHaveTextContent(
      'firstName2 lastName2'
    )
    expect(getAllByRole('listitem')[1]).toHaveTextContent(
      'firstName1 lastName1'
    )
    expect(getAllByRole('listitem')[2]).toHaveTextContent('invite@email.com')
  })

  it('should hide invites that have been removed', async () => {
    const { getByRole, getAllByRole } = render(
      <UserList
        title="Users with Access"
        users={[userJourney1]}
        invites={[{ ...userInvite, removedAt: 'dateTime' }]}
        currentUser={userJourney1}
        journeyId="journey.id"
      />
    )
    expect(
      getByRole('heading', { name: 'Users with Access' })
    ).toBeInTheDocument()
    expect(getAllByRole('listitem')).toHaveLength(1)
    expect(getAllByRole('listitem')[0]).toHaveTextContent(
      'firstName1 lastName1'
    )
  })

  it('should hide invites that have been accepted', async () => {
    const { getByRole, getAllByRole } = render(
      <UserList
        title="Users with Access"
        users={[userJourney1]}
        invites={[{ ...userInvite, acceptedAt: 'dateTime' }]}
        currentUser={userJourney1}
        journeyId="journey.id"
      />
    )
    expect(
      getByRole('heading', { name: 'Users with Access' })
    ).toBeInTheDocument()
    expect(getAllByRole('listitem')).toHaveLength(1)
    expect(getAllByRole('listitem')[0]).toHaveTextContent(
      'firstName1 lastName1'
    )
  })
})
