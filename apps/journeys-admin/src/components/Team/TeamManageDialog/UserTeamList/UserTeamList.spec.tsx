import { fireEvent, render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeamInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../__generated__/GetUserTeamsAndInvites'
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
          email: 'tatainikora@example.com',
          firstName: 'Tatai',
          id: 'userId',
          imageUrl: 'https://example.com/image.jpg',
          lastName: 'Nikora'
        }
      },
      {
        __typename: 'UserTeam',
        id: 'userTeamId2',
        role: UserTeamRole.member,
        user: {
          __typename: 'User',
          email: 'SiyangTheManMyStan@example.com',
          firstName: 'Siyang',
          id: 'userId2',
          imageUrl: 'https://example.com/image.jpg',
          lastName: 'Cao'
        }
      },
      {
        __typename: 'UserTeam',
        id: 'userTeamId3',
        role: UserTeamRole.guest,
        user: {
          __typename: 'User',
          email: 'john@example.com',
          firstName: 'John',
          id: 'userId3',
          imageUrl: 'https://example.com/image.jpg',
          lastName: 'Geronimo'
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
      email: 'tatainikora@example.com',
      firstName: 'Tatai',
      id: 'userId',
      imageUrl: 'https://example.com/image.jpg',
      lastName: 'Nikora'
    }
  }

  const mockCurrentUserTeam2: UserTeam = {
    __typename: 'UserTeam',
    id: 'userTeamId2',
    role: UserTeamRole.member,
    user: {
      __typename: 'User',
      email: 'SiyangTheManMyStan@example.com',
      firstName: 'Siyang',
      id: 'userId2',
      imageUrl: 'https://example.com/image.jpg',
      lastName: 'Cao'
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

    expect(getByText('Tatai Nikora')).toBeInTheDocument()
    expect(getByText('Siyang Cao')).toBeInTheDocument()
    expect(getByText('John Geronimo')).toBeInTheDocument()
    expect(getByText('tatainikora@example.com')).toBeInTheDocument()
    expect(getByText('SiyangTheManMyStan@example.com')).toBeInTheDocument()
    expect(getByText('john@example.com')).toBeInTheDocument()
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
    fireEvent.click(getByRole('button', { name: 'Guest' }))
    expect(getByRole('button', { name: 'Guest' })).toBeDisabled()
    expect(getByRole('button', { name: 'Member' })).toBeDisabled()
    expect(getByRole('button', { name: 'Manager' })).toBeDisabled()
  })
})
