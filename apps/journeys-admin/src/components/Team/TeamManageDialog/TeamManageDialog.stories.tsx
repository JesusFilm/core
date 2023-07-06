import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ComponentProps } from 'react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TeamProvider, GET_TEAMS } from '../TeamProvider'
import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { GET_CURRENT_USER } from '../../../libs/useCurrentUser'
import { GET_USER_TEAMS_AND_INVITES } from '../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import { TeamManageDialog } from './TeamManageDialog'

const Demo = {
  ...journeysAdminConfig,
  component: TeamManageDialog,
  title: 'Journeys-Admin/Team/TeamManageDialog'
}
const mocks = [
  {
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
              email: 'siyangguccigang@gmail.com',
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
            email: 'edmond@gmail.com',
            teamId: 'teamId',
            __typename: 'UserTeamInvite'
          }
        ]
      }
    }
  },
  {
    request: {
      query: GET_TEAMS
    },
    result: {
      data: {
        teams: [{ id: 'jfp-team', title: 'Team Title', __typename: 'Team' }]
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
          email: 'siyangguccigang@gmail.com'
        }
      }
    }
  }
]

const Template: Story<ComponentProps<typeof TeamManageDialog>> = () => (
  <MockedProvider mocks={mocks}>
    <TeamProvider>
      <TeamManageDialog open onClose={() => undefined} />
    </TeamProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export default Demo as Meta
