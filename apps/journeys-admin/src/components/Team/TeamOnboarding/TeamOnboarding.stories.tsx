import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'
import { SnackbarProvider } from 'notistack'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { TEAM_CREATE } from '../../../libs/useTeamCreateMutation/useTeamCreateMutation'

import { TeamOnboarding } from '.'

const TeamOnboardingStory: Meta<typeof TeamOnboarding> = {
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
        publicTitle: null,
        __typename: 'Team',
        userTeams: [],
        customDomains: []
      }
    }
  }
}

const Template: StoryObj<typeof TeamOnboarding> = {
  render: () => {
    return (
      <TeamProvider>
        <SnackbarProvider>
          <TeamOnboarding />
        </SnackbarProvider>
      </TeamProvider>
    )
  }
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [teamCreateMock]
    }
  },
  play: async () => {
    await userEvent.type(
      screen.getAllByRole('textbox')[0],
      'Jesus Film Project'
    )
  }
}

export default TeamOnboardingStory
