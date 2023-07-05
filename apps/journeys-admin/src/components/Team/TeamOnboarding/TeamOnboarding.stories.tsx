import { MockedResponse } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { SnackbarProvider } from 'notistack'
import { screen, userEvent } from '@storybook/testing-library'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TeamProvider } from '../TeamProvider'
import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { TEAM_CREATE } from '../../../libs/useTeamCreateMutation/useTeamCreateMutation'
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

const Template: Story = () => {
  return (
    <TeamProvider>
      <SnackbarProvider>
        <TeamOnboarding />
      </SnackbarProvider>
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

export default TeamOnboardingStory as Meta
