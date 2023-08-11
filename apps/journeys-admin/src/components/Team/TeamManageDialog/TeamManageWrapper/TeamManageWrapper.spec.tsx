import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'

import { GetLastActiveTeamIdAndTeams } from '../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { GetUserTeamsAndInvites } from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'
import { GET_USER_TEAMS_AND_INVITES } from '../../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../TeamProvider'

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
const user1 = { id: 'userId', email: 'miguelohara@example.com' }

describe('TeamMembersList', () => {
  const getUserTeamMock1: MockedResponse<GetUserTeamsAndInvites> = {
    request: {
      query: GET_USER_TEAMS_AND_INVITES,
      variables: {
        teamId: 'teamId',
        where: { role: [UserTeamRole.manager, UserTeamRole.member] }
      }
    },
    result: {
      data: {
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

  const getTeams: MockedResponse<GetLastActiveTeamIdAndTeams> = {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [
          {
            id: 'teamId',
            title: 'Team Title',
            __typename: 'Team',
            userTeams: []
          }
        ],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }
  }

  const mocks = [getUserTeamMock1, getTeams]

  it('shows both users in the team and the invites to the team', async () => {
    const { getByText } = render(
      <MockedProvider mocks={mocks}>
        <TeamProvider>
          <TeamManageWrapper>
            {({ userTeamList, userTeamInviteList, userTeamInviteForm }) => (
              <>
                {userTeamList}
                {userTeamInviteList}
                {userTeamInviteForm}
              </>
            )}
          </TeamManageWrapper>
        </TeamProvider>
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getByText('miguelohara@example.com')).toBeInTheDocument()
      expect(getByText('edmond@example.com')).toBeInTheDocument()
    })
  })
})
