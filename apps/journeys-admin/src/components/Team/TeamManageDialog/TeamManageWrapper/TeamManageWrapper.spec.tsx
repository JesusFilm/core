import { render, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'
import { GET_USER_TEAMS_AND_INVITES } from '../../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import { GetUserTeamsAndInvites } from '../../../../../__generated__/GetUserTeamsAndInvites'
import { GET_TEAMS, TeamProvider } from '../../TeamProvider'
import { GetTeams } from '../../../../../__generated__/GetTeams'
import { TeamManageWrapper } from './TeamManageWrapper'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('../../../../libs/useCurrentUser', () => ({
  __esModule: true,
  useCurrentUser: jest.fn().mockReturnValue({
    loadUser: jest.fn(),
    data: {
      __typename: 'User',
      ...user1
    }
  })
}))
const user1 = { id: 'userId', email: 'siyangguccigang@gmail.com' }

describe('TeamMembersList', () => {
  const getUserTeamMock1: MockedResponse<GetUserTeamsAndInvites> = {
    request: {
      query: GET_USER_TEAMS_AND_INVITES,
      variables: { teamId: 'jfp-team' }
    },
    result: {
      data: {
        userTeams: [
          {
            id: 'userTeamId',
            __typename: 'UserTeam',
            role: UserTeamRole.manager,
            user: {
              __typename: 'User',
              email: 'siyangguccigang@example.com',
              firstName: 'Siyang',
              id: 'userId',
              imageUrl: 'imageURL',
              lastName: 'Gang'
            }
          }
        ],
        userTeamInvites: [
          {
            id: 'inviteId',
            email: 'edmond@example.com',
            teamId: 'teamId',
            __typename: 'UserTeamInvite'
          }
        ]
      }
    }
  }

  const getTeams: MockedResponse<GetTeams> = {
    request: {
      query: GET_TEAMS
    },
    result: {
      data: {
        teams: [{ id: 'jfp-team', title: 'Team Title', __typename: 'Team' }]
      }
    }
  }

  const mocks = [getUserTeamMock1, getTeams]
  it('shows both users in the team and the invites to the team', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <TeamProvider>
          <TeamManageWrapper>
            {({ UserTeamList, UserTeamInviteList, UserTeamInviteForm }) => (
              <>
                {UserTeamList}
                {UserTeamInviteList}
                {UserTeamInviteForm}
              </>
            )}
          </TeamManageWrapper>
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getByText('siyangguccigang@example.com')).toBeInTheDocument()
      expect(getByText('edmond@example.com')).toBeInTheDocument()
    })
  })
})
