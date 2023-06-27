import { Story, Meta } from '@storybook/react'
import { MockedResponse } from '@apollo/client/testing'
import { GET_TEAMS, TeamProvider } from '../TeamProvider'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GetTeams } from '../../../../__generated__/GetTeams'
import { TeamSelect } from '.'

const TeamSelectStory = {
  ...journeysAdminConfig,
  component: TeamSelect,
  title: 'Journeys-Admin/Team/TeamSelect'
}

const getTeamsMock: MockedResponse<GetTeams> = {
  request: {
    query: GET_TEAMS
  },
  result: {
    data: {
      teams: [
        { id: 'teamId', title: 'Jesus Film Project', __typename: 'Team' },
        { id: 'teamId', title: "Brian's Team", __typename: 'Team' }
      ]
    }
  }
}
const getEmptyTeamsMock: MockedResponse<GetTeams> = {
  request: {
    query: GET_TEAMS
  },
  result: {
    data: {
      teams: []
    }
  }
}

const Template: Story = () => (
  <TeamProvider>
    <TeamSelect />
  </TeamProvider>
)

export const Default = Template.bind({})
Default.parameters = {
  apolloClient: {
    mocks: [getTeamsMock]
  }
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
