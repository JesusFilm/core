import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { GetJourneyWithUserJourneys_journey_userJourneys as UserJourney } from '../../../../../__generated__/GetJourneyWithUserJourneys'
import { UserJourneyRole } from '../../../../../__generated__/globalTypes'
import { USER_JOURNEY_APPROVE } from './ApproveUser/ApproveUser'
import { USER_JOURNEY_REMOVE } from './RemoveUser/RemoveUser'
import { USER_JOURNEY_PROMOTE } from './PromoteUser/PromoteUser'
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
    imageUrl: null
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

const invitee: UserJourney = {
  __typename: 'UserJourney',
  id: 'userJourneyInvitee.id',
  role: UserJourneyRole.inviteRequested,
  user: {
    __typename: 'User',
    id: 'invitee.id',
    firstName: 'inviteeFirstName',
    lastName: 'inviteeLastName',
    email: 'invitee@email.com',
    imageUrl: null
  }
}

describe('UserListItem', () => {
  it('should approve invitee as editor', async () => {
    const result = jest.fn(() => ({
      data: {
        userJourneyApprove: {
          __typename: 'UserJourney',
          id: invitee.id,
          role: UserJourneyRole.editor
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_JOURNEY_APPROVE,
              variables: { id: invitee.id }
            },
            result
          }
        ]}
      >
        <UserListItem userJourney={invitee} disabled={false} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Manage Access' }))
    fireEvent.click(getByRole('menuitem', { name: 'Approve' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should remove editor', async () => {
    const result = jest.fn(() => ({
      data: {
        userJourneyRemove: {
          __typename: 'UserJourney',
          id: editor.id,
          role: UserJourneyRole.editor,
          journey: {
            __typename: 'Journey',
            id: 'journeyId'
          }
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: USER_JOURNEY_REMOVE,
              variables: {
                id: editor.id
              }
            },
            result
          }
        ]}
      >
        <UserListItem userJourney={editor} disabled={false} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Editor' }))
    fireEvent.click(getByRole('menuitem', { name: 'Remove' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should promote editor to owner', async () => {
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

    const { getByRole } = render(
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
        <UserListItem userJourney={editor} disabled={false} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Editor' }))
    fireEvent.click(getByRole('menuitem', { name: 'Promote' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should not allow owners to edit their own access', async () => {
    const { getByRole } = render(
      <UserListItem userJourney={owner} disabled={false} />
    )
    expect(getByRole('button', { name: 'Owner' })).toBeDisabled()
  })

  it('should disable edit', async () => {
    const { getByRole } = render(<UserListItem userJourney={editor} disabled />)
    expect(getByRole('button', { name: 'Editor' })).toBeDisabled()
  })
})
