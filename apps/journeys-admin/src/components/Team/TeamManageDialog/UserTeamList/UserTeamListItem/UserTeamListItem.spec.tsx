import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { UserTeamRole } from '../../../../../../__generated__/globalTypes'
import { GetUserTeamsAndInvites_userTeams as UserTeam } from '../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamListItem, USER_TEAM_UPDATE } from './UserTeamListItem'

describe('UserTeamListItem', () => {
  const mockUser: UserTeam = {
    id: 'userTeamId',
    role: UserTeamRole.member,
    __typename: 'UserTeam',
    user: {
      __typename: 'User',
      id: 'userId',
      email: 'edmondshen@example.com',
      firstName: 'Edmond',
      lastName: 'Shen',
      imageUrl: 'image'
    }
  }

  const result = jest.fn(() => ({
    data: {
      userTeamUpdate: {
        id: 'userTeamId',
        role: UserTeamRole.guest,
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
          userTeamUpdateId: 'userTeamId',
          input: { role: UserTeamRole.guest }
        }
      },
      result
    }
  ]

  it('it should change the team member permissions correctly', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider mocks={mocks}>
        <UserTeamListItem user={mockUser} disabled={false} />
      </MockedProvider>
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByText('Guest'))
    await waitFor(() => {
      expect(result).toHaveBeenCalled()
    })
  })
})
