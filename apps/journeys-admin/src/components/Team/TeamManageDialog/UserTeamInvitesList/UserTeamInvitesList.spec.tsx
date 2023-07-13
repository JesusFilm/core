import { render } from '@testing-library/react'
import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'
import { UserTeamInvitesList } from './UserTeamInvitesList'

describe('UserTeamInvitesList', () => {
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
      }
    ],
    userTeamInvites: [
      {
        __typename: 'UserTeamInvite',
        id: 'userTeamInviteId',
        email: 'milesmorales@example.com',
        teamId: 'teamId'
      },
      {
        __typename: 'UserTeamInvite',
        id: 'userTeamInviteId',
        email: 'gwenstacy@example.com',
        teamId: 'teamId'
      },
      {
        __typename: 'UserTeamInvite',
        id: 'userTeamInviteId',
        email: 'peterparker@example.com',
        teamId: 'teamId'
      }
    ]
  }

  const mockCurrentUser: UserTeam = {
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

  const mockCurrentUser2: UserTeam = {
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
  it('shows the emails of everyone invited to team', () => {
    const { getByText, getAllByText, getAllByRole } = render(
      <UserTeamInvitesList data={mockData} currentUserTeam={mockCurrentUser} />
    )

    const button = getAllByRole('button')[0]

    expect(getByText('peterparker@example.com')).toBeInTheDocument()
    expect(getByText('gwenstacy@example.com')).toBeInTheDocument()
    expect(getByText('milesmorales@example.com')).toBeInTheDocument()
    expect(getAllByText('Pending')).toHaveLength(3)
    expect(button).not.toBeDisabled()
  })

  it('disabled pending button if user does not have correct permissions', () => {
    const { getAllByRole } = render(
      <UserTeamInvitesList data={mockData} currentUserTeam={mockCurrentUser2} />
    )

    const button = getAllByRole('button')[0]
    const button1 = getAllByRole('button')[1]
    const button2 = getAllByRole('button')[2]
    expect(button).toBeDisabled()
    expect(button1).toBeDisabled()
    expect(button2).toBeDisabled()
  })
})
