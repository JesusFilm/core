import { Story, Meta } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { screen, userEvent } from '@storybook/testing-library'
import { MockedResponse } from '@apollo/client/testing'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { TeamMenu } from '.'

const TeamMenuStory = {
  ...journeysAdminConfig,
  component: TeamMenu,
  title: 'Journeys-Admin/Team/TeamMenu',
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
        { id: 'teamId', title: 'Jesus Film Project', __typename: 'Team' }
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

const Template: Story = () => (
  <TeamProvider>
    <SnackbarProvider>
      <TeamMenu />
    </SnackbarProvider>
  </TeamProvider>
)

export const Default = Template.bind({})
Default.parameters = {
  apolloClient: {
    mocks: [getTeamsMock]
  }
}
Default.play = async () => {
  userEvent.click(screen.getByRole('button'))
}

export const EmptyTeams = Template.bind({})
EmptyTeams.parameters = {
  apolloClient: {
    mocks: [getEmptyTeamsMock]
  }
}
EmptyTeams.play = async () => {
  userEvent.click(screen.getByRole('button'))
}

export default TeamMenuStory as Meta
