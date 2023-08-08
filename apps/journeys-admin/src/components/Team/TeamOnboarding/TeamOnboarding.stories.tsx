import { MockedResponse } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { SnackbarProvider } from 'notistack'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { GetUserTeamsAndInvites } from '../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TEAM_CREATE } from '../../../libs/useTeamCreateMutation/useTeamCreateMutation'
import { GET_USER_TEAMS_AND_INVITES } from '../../../libs/useUserTeamsAndInvitesQuery/useUserTeamsAndInvitesQuery'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { TeamOnboarding } from '.'

const TeamOnboardingStory = {
  ...journeysAdminConfig,
  component: TeamOnboarding,
  title: 'Journeys-Admin/Team/TeamOnboarding'
}

const teamCreateMock: MockedResponse<TeamCreate> = {
  request: {
    query: TEAM_CREATE,
    variables: {
      input: {
        title: 'Jesus Film Project'
      }
    }
  },
  result: {
    data: {
      teamCreate: {
        id: 'teamId',
        title: 'Jesus Film Project',
        __typename: 'Team'
      }
    }
  }
}

const getTeams: MockedResponse<GetLastActiveTeamIdAndTeams> = {
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
}

const getUserTeamMock1: MockedResponse<GetUserTeamsAndInvites> = {
  request: {
    query: GET_USER_TEAMS_AND_INVITES,
    variables: { teamId: 'teamId' }
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
          email: 'edmondshen@gmail.com',
          teamId: 'teamId',
          __typename: 'UserTeamInvite'
        }
      ]
    }
  }
}

const Template: Story = () => {
  return (
    <TeamProvider>
      <TeamProvider>
        <SnackbarProvider>
          <TeamOnboarding />
        </SnackbarProvider>
      </TeamProvider>
    </TeamProvider>
  )
}

export const Default = Template.bind({})
Default.parameters = {
  apolloClient: {
    mocks: [teamCreateMock]
  }
}
Default.play = async () => {
  userEvent.type(screen.getByRole('textbox'), 'Jesus Film Project')
}

export const InviteMembers = Template.bind({})
InviteMembers.parameters = {
  apolloClient: {
    mocks: [getTeams, getUserTeamMock1]
  }
}

export default TeamOnboardingStory as Meta
