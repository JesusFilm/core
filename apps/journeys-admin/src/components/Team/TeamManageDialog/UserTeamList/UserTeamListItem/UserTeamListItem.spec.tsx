import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GetUserTeamsAndInvites_userTeams as UserTeam } from '../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../__generated__/globalTypes'

import { USER_TEAM_UPDATE, UserTeamListItem } from './UserTeamListItem'

describe('UserTeamListItem', () => {
  const mockUser: UserTeam = {
    __typename: 'UserTeam',
    id: 'userTeamId',
    role: UserTeamRole.manager,
    user: {
      __typename: 'User',
      email: 'miguelohara@example.com',
      firstName: 'Miguel',
      id: 'userId',
      imageUrl: 'https://example.com/image.jpg',
      lastName: "O'Hara"
    }
  }

  const result = jest.fn(() => ({
    data: {
      userTeamUpdate: {
        id: 'userTeamId',
        role: UserTeamRole.member,
        user: {
          id: 'userId'
        }
      }
    }
  }))

  const mocks = [
    {
      request: {
        query: USER_TEAM_UPDATE,
        variables: {
          id: 'userTeamId',
          input: { role: UserTeamRole.member }
        }
      },
      result
    }
  ]

  const mockCurrentUserTeam: UserTeam = {
    __typename: 'UserTeam',
    id: 'userTeamId',
    role: UserTeamRole.manager,
    user: {
      __typename: 'User',
      email: 'miguelohara@example.com',
      firstName: 'Miguel',
      id: 'userId',
      imageUrl: 'https://example.com/image.jpg',
      lastName: "O'Hara"
    }
  }

  it('should change the team member permissions correctly', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={mocks}>
        <UserTeamListItem
          user={mockUser}
          disabled={false}
          currentUserTeam={mockCurrentUserTeam}
        />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByText('Member'))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })
})
