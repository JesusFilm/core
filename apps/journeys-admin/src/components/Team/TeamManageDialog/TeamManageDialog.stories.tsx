import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { ApolloLoadingProvider } from '../../../../test/ApolloLoadingProvider'
import { GET_CURRENT_USER } from '../../../libs/useCurrentUserLazyQuery'
import { GET_USER_TEAMS_AND_INVITES } from '../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'

import { TeamManageDialog } from './TeamManageDialog'

const Demo: Meta<typeof TeamManageDialog> = {
  ...journeysAdminConfig,
  component: TeamManageDialog,
  title: 'Journeys-Admin/Team/TeamManageDialog'
}
const mocks = [
  {
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
  },
  {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [{ id: 'teamId', title: 'Team Title', __typename: 'Team' }],
        getJourneyProfile: {
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }
  },
  {
    request: {
      query: GET_CURRENT_USER
    },
    result: {
      data: {
        me: {
          id: 'userId',
          email: 'siyangguccigang@example.com'
        }
      }
    }
  }
]

export const Default: StoryObj<typeof TeamManageDialog> = {
  render: () => {
    return (
      <MockedProvider mocks={mocks}>
        <TeamProvider>
          <TeamManageDialog open onClose={() => undefined} />
        </TeamProvider>
      </MockedProvider>
    )
  }
}

export const Loading: StoryObj<typeof TeamManageDialog> = {
  render: () => {
    return (
      <ApolloLoadingProvider>
        <TeamManageDialog open onClose={() => undefined} />
      </ApolloLoadingProvider>
    )
  }
}

export default Demo
