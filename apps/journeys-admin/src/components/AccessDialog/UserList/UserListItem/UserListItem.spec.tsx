import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { ComponentProps, ReactElement } from 'react'

import { GetJourneyWithUserJourneys_journey_userJourneys as UserJourney } from '../../../../../__generated__/GetJourneyWithUserJourneys'
import { GetUserInvites_userInvites as UserInvite } from '../../../../../__generated__/GetUserInvites'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'

import { USER_JOURNEY_APPROVE } from './ApproveUser/ApproveUser'
import { USER_JOURNEY_PROMOTE } from './PromoteUser/PromoteUser'
import { USER_INVITE_REMOVE } from './RemoveUser/RemoveUser'

import { UserListItem } from '.'

const owner: UserJourney = {
  __typename: 'UserJourney',
  id: 'userJourneyOwner.id',
  role: UserJourneyRole.owner,
  user: {
    __typename: 'User',
    id: 'owner.id',
    firstName: 'ownerFirstName',
    lastName: 'ownerLastName',
    email: 'owner@email.com',
    imageUrl: 'imageSrc'
  }
}

const editor: UserJourney = {
  __typename: 'UserJourney',
  id: 'userJourneyEditor.id',
  role: UserJourneyRole.editor,
  user: {
    __typename: 'User',
    id: 'editor.id',
    firstName: 'editorFirstName',
    lastName: 'editorLastName',
    email: 'editor@email.com',
    imageUrl: null
  }
}

const editor2: UserJourney = {
  __typename: 'UserJourney',
  id: 'userJourneyEditor2.id',
  role: UserJourneyRole.editor,
  user: {
    __typename: 'User',
    id: 'editor2.id',
    firstName: 'editorFirstName',
    lastName: 'editorLastName',
    email: 'editor2@email.com',
    imageUrl: null
  }
}

const userRequest: UserJourney = {
  __typename: 'UserJourney',
  id: 'userJourneyRequest.id',
  role: UserJourneyRole.inviteRequested,
  user: {
    __typename: 'User',
    id: 'request.id',
    firstName: 'requestFirstName',
    lastName: 'requestLastName',
    email: 'request@email.com',
    imageUrl: null
  }
}

const userInvite: UserInvite = {
  __typename: 'UserInvite',
  id: 'invite.id',
  journeyId: 'journey.id',
  email: 'invite@email.com',
  acceptedAt: null,
  removedAt: null
}

const UserListItemComponent = ({
  listItem,
  currentUser
}: ComponentProps<typeof UserListItem>): ReactElement => (
  <MockedProvider mocks={[]}>
    <UserListItem
      listItem={listItem}
      currentUser={currentUser}
      journeyId="journeyId"
    />
  </MockedProvider>
)

describe('UserListItem', () => {
  it('should display user avatar', () => {
    const { getByRole } = render(
      <UserListItemComponent
        listItem={owner}
        currentUser={owner}
        journeyId="journeyId"
      />
    )

    expect(getByRole('img').getAttribute('alt')).toBe(
      `${owner.user?.firstName ?? ''} ${owner.user?.lastName ?? ''}`
    )
    expect(getByRole('img').getAttribute('src')).toBe('imageSrc')
  })

  // TODO: Add display invited user avatar once StatusIndicators PR merged

  describe('owner permissions', () => {
    it('should not allow owners to edit their own access', () => {
      const { getByRole } = render(
        <UserListItemComponent
          listItem={owner}
          currentUser={owner}
          journeyId="journeyId"
        />
      )

      expect(getByRole('button', { name: 'Owner' })).toBeDisabled()
    })

    it('should enable all access actions to owners on editors', () => {
      const { getByRole, getAllByRole } = render(
        <UserListItemComponent
          listItem={editor}
          currentUser={owner}
          journeyId="journeyId"
        />
      )

      expect(getByRole('button', { name: 'Editor' })).not.toBeDisabled()

      fireEvent.click(getByRole('button', { name: 'Editor' }))

      expect(getAllByRole('menuitem')).toHaveLength(2)
      expect(getByRole('menuitem', { name: 'Promote' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Remove' })).toBeInTheDocument()
    })

    it('should enable all access actions to owners on requested invites', () => {
      const { getByRole, getAllByRole } = render(
        <UserListItemComponent
          listItem={userRequest}
          currentUser={owner}
          journeyId="journeyId"
        />
      )

      expect(getByRole('button', { name: 'Manage' })).not.toBeDisabled()

      fireEvent.click(getByRole('button', { name: 'Manage' }))

      expect(getAllByRole('menuitem')).toHaveLength(2)
      expect(getByRole('menuitem', { name: 'Approve' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Remove' })).toBeInTheDocument()
    })

    it('should enable all access actions to owners on email invites', () => {
      const { getByRole, getAllByRole } = render(
        <UserListItemComponent
          listItem={userInvite}
          currentUser={owner}
          journeyId="journeyId"
        />
      )

      expect(getByRole('button', { name: 'Pending' })).not.toBeDisabled()

      fireEvent.click(getByRole('button', { name: 'Pending' }))

      expect(getAllByRole('menuitem')).toHaveLength(1)
      expect(getByRole('menuitem', { name: 'Remove' })).toBeInTheDocument()
    })
  })

  describe('editor permissions', () => {
    it('should block editors from editing owners access', () => {
      const { getByRole } = render(
        <UserListItemComponent
          listItem={owner}
          currentUser={editor}
          journeyId="journeyId"
        />
      )

      expect(getByRole('button', { name: 'Owner' })).toBeDisabled()
    })

    it('should block editors from editing other editors access', () => {
      const { getByRole } = render(
        <UserListItemComponent
          listItem={editor2}
          currentUser={editor}
          journeyId="journeyId"
        />
      )

      expect(getByRole('button', { name: 'Editor' })).toBeDisabled()
    })

    it('should not allow editors to remove their own access', () => {
      const { getByRole } = render(
        <UserListItemComponent
          listItem={editor}
          currentUser={editor}
          journeyId="journeyId"
        />
      )

      expect(getByRole('button', { name: 'Editor' })).toBeDisabled()
    })

    it('should allow editors to edit access on requested users', () => {
      const { getByRole, getAllByRole } = render(
        <UserListItemComponent
          listItem={userRequest}
          currentUser={editor}
          journeyId="journeyId"
        />
      )

      expect(getByRole('button', { name: 'Manage' })).not.toBeDisabled()

      fireEvent.click(getByRole('button', { name: 'Manage' }))

      expect(getAllByRole('menuitem')).toHaveLength(2)
      expect(getByRole('menuitem', { name: 'Approve' })).toBeInTheDocument()
      expect(getByRole('menuitem', { name: 'Remove' })).toBeInTheDocument()
    })

    it('should allow editors to edit access on invited users', () => {
      const { getByRole, getAllByRole } = render(
        <UserListItemComponent
          listItem={userInvite}
          currentUser={editor}
          journeyId="journeyId"
        />
      )

      expect(getByRole('button', { name: 'Pending' })).not.toBeDisabled()

      fireEvent.click(getByRole('button', { name: 'Pending' }))

      expect(getAllByRole('menuitem')).toHaveLength(1)
      expect(getByRole('menuitem', { name: 'Remove' })).toBeInTheDocument()
    })
  })

  it('should block all other roles from editing users access by default', () => {
    const { getByRole } = render(
      <UserListItemComponent
        listItem={userRequest}
        currentUser={userRequest}
        journeyId="journeyId"
      />
    )

    expect(getByRole('button', { name: 'Manage' })).toBeDisabled()
  })

  describe('menu actions', () => {
    it('should handle on promote action', async () => {
      const result = jest.fn(() => ({
        data: {
          userJourneyPromote: {
            __typename: 'UserJourney',
            id: editor.id,
            role: UserJourneyRole.owner,
            journey: {
              __typename: 'Journey',
              id: 'journeyId',
              userJourneys: [
                {
                  __typename: 'UserJourney',
                  id: 'journeyId',
                  role: UserJourneyRole.owner
                }
              ]
            }
          }
        }
      }))

      const { getByRole, queryByRole } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: USER_JOURNEY_PROMOTE,
                variables: {
                  id: editor.id
                }
              },
              result
            }
          ]}
        >
          <UserListItem
            listItem={editor}
            currentUser={owner}
            journeyId="journeyId"
          />
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Editor' }))
      expect(getByRole('menu')).toBeInTheDocument()

      fireEvent.click(getByRole('menuitem', { name: 'Promote' }))

      await waitFor(() => expect(result).toHaveBeenCalled())
      await waitFor(() => expect(queryByRole('menu')).not.toBeInTheDocument())
    })

    it('should handle approve action', async () => {
      const result = jest.fn(() => ({
        data: {
          userJourneyApprove: {
            __typename: 'UserJourney',
            id: userRequest.id,
            role: UserJourneyRole.editor
          }
        }
      }))
      const { getByRole, queryByRole } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: USER_JOURNEY_APPROVE,
                variables: { id: userRequest.id }
              },
              result
            }
          ]}
        >
          <UserListItem
            listItem={userRequest}
            currentUser={owner}
            journeyId="journeyId"
          />
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Manage' }))
      expect(getByRole('menu')).toBeInTheDocument()

      fireEvent.click(getByRole('menuitem', { name: 'Approve' }))

      await waitFor(() => expect(result).toHaveBeenCalled())
      await waitFor(() => expect(queryByRole('menu')).not.toBeInTheDocument())
    })

    it('should handle remove action', async () => {
      const result = jest.fn(() => ({
        data: {
          userInviteRemove: {
            __typename: 'UserInvite',
            id: userInvite.id,
            journeyId: 'journey.id',
            acceptedAt: null,
            removedAt: 'dateTime'
          }
        }
      }))

      const { getByRole, queryByRole } = render(
        <MockedProvider
          mocks={[
            {
              request: {
                query: USER_INVITE_REMOVE,
                variables: {
                  id: userInvite.id,
                  journeyId: userInvite.journeyId
                }
              },
              result
            }
          ]}
        >
          <UserListItem
            listItem={userInvite}
            currentUser={owner}
            journeyId="journey.id"
          />
        </MockedProvider>
      )

      await waitFor(() =>
        fireEvent.click(getByRole('button', { name: 'Pending' }))
      )
      expect(getByRole('menu')).toBeInTheDocument()
      await waitFor(() =>
        fireEvent.click(getByRole('menuitem', { name: 'Remove' }))
      )

      await waitFor(() => expect(result).toHaveBeenCalled())
      await waitFor(() => expect(queryByRole('menu')).not.toBeInTheDocument())
    })
  })
})
