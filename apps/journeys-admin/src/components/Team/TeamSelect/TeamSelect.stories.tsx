import { MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { TeamSelect } from '.'

const TeamSelectStory = {
  ...journeysAdminConfig,
  component: TeamSelect,
  title: 'Journeys-Admin/Team/TeamSelect',
  parameters: {
    ...journeysAdminConfig.parameters,
    chromatic: {
      ...journeysAdminConfig.parameters?.chromatic,
      viewports: [360]
    }
  }
}

const getTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams: [
        {
          id: 'teamId',
          title: 'Jesus Film Project',
          __typename: 'Team',
          userTeams: []
        },
        {
          id: 'teamId1',
          title: "Brian's Team",
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
const getEmptyTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> = {
  request: {
    query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
  },
  result: {
    data: {
      teams: [],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        lastActiveTeamId: null
      }
    }
  }
}

const Template: Story = (args) => (
  <TeamProvider>
    <Box sx={{ height: 300 }}>
      <TeamSelect {...args} />
    </Box>
  </TeamProvider>
)

export const Default = Template.bind({})
Default.parameters = {
  apolloClient: {
    mocks: [getTeamsMock]
  }
}

export const Onboarding = Template.bind({})
Onboarding.parameters = {
  apolloClient: {
    mocks: [getTeamsMock]
  }
}
Onboarding.args = {
  onboarding: true
}

export const Loading = Template.bind({})
Loading.parameters = {
  apolloClient: {
    mocks: [{ ...getTeamsMock, delay: 100000000000000 }]
  }
}

export const EmptyTeams = Template.bind({})
EmptyTeams.parameters = {
  apolloClient: {
    mocks: [getEmptyTeamsMock]
  }
}

export default TeamSelectStory as Meta
