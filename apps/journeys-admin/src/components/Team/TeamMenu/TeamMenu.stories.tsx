import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'
import { SnackbarProvider } from 'notistack'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { TeamMenu } from '.'

const TeamMenuStory: Meta<typeof TeamMenu> = {
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
        {
          id: 'teamId',
          title: 'Jesus Film Project',
          publicTitle: null,
          __typename: 'Team',
          userTeams: [],
          customDomains: []
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        id: 'journeyProfileId',
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
        id: 'journeyProfileId',
        lastActiveTeamId: null
      }
    }
  }
}

const Template: StoryObj<typeof TeamMenu> = {
  render: () => (
    <TeamProvider>
      <SnackbarProvider>
        <TeamMenu />
      </SnackbarProvider>
    </TeamProvider>
  )
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getTeamsMock]
    }
  },
  play: async () => {
    await userEvent.click(screen.getByRole('button'))
  }
}

export const EmptyTeams = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getEmptyTeamsMock]
    }
  },
  play: async () => {
    await userEvent.click(screen.getByRole('button'))
  }
}

export default TeamMenuStory
