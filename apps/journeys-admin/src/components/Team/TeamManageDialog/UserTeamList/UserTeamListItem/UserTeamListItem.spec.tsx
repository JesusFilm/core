import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GetUserTeamsAndInvites_userTeams as UserTeam } from '../../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../../__generated__/globalTypes'

import { USER_TEAM_UPDATE, UserTeamListItem } from './UserTeamListItem'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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

  it('should change the team member permissions correctly', async () => {
    const mockHandleTeamDataChange = jest.fn()
    const { getByText, getByRole } = render(
      <MockedProvider mocks={mocks}>
        <UserTeamListItem
          user={mockUser}
          disabled={false}
          handleTeamDataChange={mockHandleTeamDataChange}
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
