import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeamInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'

import { UserTeamList } from './UserTeamList'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('UserTeamList', () => {
  const mockData: GetUserTeamsAndInvites = {
    userTeams: [
      {
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
      },
      {
        __typename: 'UserTeam',
        id: 'userTeamId2',
        role: UserTeamRole.member,
        user: {
          __typename: 'User',
          email: 'hobiebrown@example.com',
          firstName: 'Hobie',
          id: 'userId2',
          imageUrl: 'https://example.com/image.jpg',
          lastName: 'Brown'
        }
      }
    ],
    userTeamInvites: []
  }

  const emptyMockData: GetUserTeamsAndInvites | undefined = {
    userTeams: undefined as unknown as UserTeam[],
    userTeamInvites:
      undefined as unknown as GetUserTeamsAndInvites_userTeamInvites[]
  }

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

  const mockCurrentUserTeam2: UserTeam = {
    __typename: 'UserTeam',
    id: 'userTeamId2',
    role: UserTeamRole.member,
    user: {
      __typename: 'User',
      email: 'hobiebrown@example.com',
      firstName: 'Hobie',
      id: 'userId2',
      imageUrl: 'https://example.com/image.jpg',
      lastName: 'Brown'
    }
  }

  it('should show users in the team if present', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <UserTeamList
          data={mockData}
          currentUserTeam={mockCurrentUserTeam}
          loading={false}
        />
      </MockedProvider>
    )

    expect(getByText("Miguel O'Hara")).toBeInTheDocument()
    expect(getByText('Hobie Brown')).toBeInTheDocument()
    expect(getByText('miguelohara@example.com')).toBeInTheDocument()
    expect(getByText('hobiebrown@example.com')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Manager' })).toBeDisabled()
  })

  it('should show loading skeleton if team not present', () => {
    const { getAllByTestId } = render(
      <MockedProvider>
        <UserTeamList
          data={emptyMockData}
          currentUserTeam={mockCurrentUserTeam}
          loading={false}
        />
      </MockedProvider>
    )

    expect(getAllByTestId('loading-skeleton')).toHaveLength(3)
  })

  it('should disable buttons if current user is not a manager of the team', () => {
    const { getByRole } = render(
      <MockedProvider>
        <UserTeamList
          data={mockData}
          currentUserTeam={mockCurrentUserTeam2}
          loading={false}
        />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Member' })).toBeDisabled()
    expect(getByRole('button', { name: 'Manager' })).toBeDisabled()
  })

  it('should disable buttons if variant is readonly', () => {
    const { getByRole } = render(
      <MockedProvider>
        <UserTeamList
          data={mockData}
          currentUserTeam={mockCurrentUserTeam}
          loading={false}
          variant="readonly"
        />
      </MockedProvider>
    )
    expect(getByRole('button', { name: 'Member' })).toBeDisabled()
    expect(getByRole('button', { name: 'Manager' })).toBeDisabled()
  })
})
