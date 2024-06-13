import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { GetJourneyWithPermissions_journey_userJourneys as UserJourney } from '../../../../__generated__/GetJourneyWithPermissions'
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
    },
    journeyNotification: null
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
    },
    journeyNotification: null
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
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <UserList
            title="Users with Access"
            users={[userJourney1, userJourney2]}
            invites={[userInvite]}
            currentUser={userJourney1}
            journeyId="journey.id"
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('Users with Access')).toBeInTheDocument()
    expect(getByText('firstName2 lastName2')).toBeInTheDocument()
    expect(getByText('firstName1 lastName1')).toBeInTheDocument()
    expect(getByText('invite@email.com')).toBeInTheDocument()
  })

  it('should hide invites that have been removed', async () => {
    const { getByText, queryByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <UserList
            title="Users with Access"
            users={[userJourney1]}
            invites={[{ ...userInvite, removedAt: 'dateTime' }]}
            currentUser={userJourney1}
            journeyId="journey.id"
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('Users with Access')).toBeInTheDocument()
    expect(getByText('firstName1 lastName1')).toBeInTheDocument()
    expect(queryByText('invite@email.com')).not.toBeInTheDocument()
  })

  it('should hide invites that have been accepted', async () => {
    const { queryByText, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <UserList
            title="Users with Access"
            users={[userJourney1]}
            invites={[{ ...userInvite, acceptedAt: 'dateTime' }]}
            currentUser={userJourney1}
            journeyId="journey.id"
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('Users with Access')).toBeInTheDocument()
    expect(getByText('firstName1 lastName1')).toBeInTheDocument()
    expect(queryByText('invite@email.com')).not.toBeInTheDocument()
  })

  it('should not allow update of email notifications of users that is not current user', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <UserList
            title="Users with Access"
            users={[userJourney2]}
            invites={[{ ...userInvite, acceptedAt: 'dateTime' }]}
            currentUser={userJourney1}
            journeyId="journey.id"
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('checkbox')).toBeDisabled()
  })
})
