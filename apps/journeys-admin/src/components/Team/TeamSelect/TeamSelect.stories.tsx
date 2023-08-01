import { Story, Meta } from '@storybook/react'
import { MockedResponse } from '@apollo/client/testing'
import { waitFor, within } from '@storybook/testing-library'
import { GET_TEAMS, TeamProvider } from '../TeamProvider'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GetTeams } from '../../../../__generated__/GetTeams'
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

const Template: Story = (args) => (
  <TeamProvider>
    <TeamSelect {...args} />
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
Onboarding.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)
  await waitFor(() => {
    expect(canvas.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument()
  })
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
