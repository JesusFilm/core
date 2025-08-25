import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeamInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'

import { UserTeamList } from './UserTeamList'

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

  it('should not allow update of email notifications of users that is not current user', () => {
    const { getAllByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <UserTeamList
            data={mockData}
            currentUserTeam={mockCurrentUserTeam}
            loading={false}
            variant="readonly"
            journeyId="journeyId"
          />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getAllByRole('checkbox')[1]).toBeDisabled()
  })

  it('should render team list in readonly mode even when currentUserTeam is null', () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <UserTeamList
          data={mockData}
          currentUserTeam={undefined}
          loading={false}
          variant="readonly"
        />
      </MockedProvider>
    )

    // Should still render team members
    expect(getByText("Miguel O'Hara")).toBeInTheDocument()
    expect(getByText('Hobie Brown')).toBeInTheDocument()
    expect(getByText('miguelohara@example.com')).toBeInTheDocument()
    expect(getByText('hobiebrown@example.com')).toBeInTheDocument()
    
    // All buttons should be disabled in readonly mode
    expect(getByRole('button', { name: 'Manager' })).toBeDisabled()
    expect(getByRole('button', { name: 'Member' })).toBeDisabled()
  })

  it('should render nothing when currentUserTeam is null and variant is default', () => {
    const { container, queryByText } = render(
      <MockedProvider>
        <UserTeamList
          data={mockData}
          currentUserTeam={undefined}
          loading={false}
          variant="default"
        />
      </MockedProvider>
    )

    // Should not render team members when currentUserTeam is null and variant is default
    expect(queryByText("Miguel O'Hara")).not.toBeInTheDocument()
    expect(queryByText('Hobie Brown')).not.toBeInTheDocument()
    
    // Should render only empty fragments (no substantial content)
    expect(container.firstChild).toBeNull()
  })
})
