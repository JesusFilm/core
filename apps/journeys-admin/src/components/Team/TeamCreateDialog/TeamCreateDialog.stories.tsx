import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useState } from 'react'

import { TeamProvider } from '@core/journeys/ui/TeamProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { TEAM_CREATE } from '../../../libs/useTeamCreateMutation/useTeamCreateMutation'

import { TeamCreateDialog } from '.'

const TeamCreateDialogStory: Meta<typeof TeamCreateDialog> = {
  ...journeysAdminConfig,
  component: TeamCreateDialog,
  title: 'Journeys-Admin/Team/TeamCreateDialog'
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

const TeamCreateDialogComponent = (): ReactElement => {
  const [open, setOpen] = useState(true)
  return (
    <TeamProvider>
      <SnackbarProvider>
        <TeamCreateDialog
          open={open}
          onClose={() => setOpen(false)}
          onCreate={() => setOpen(false)}
        />
      </SnackbarProvider>
    </TeamProvider>
  )
}

const Template: StoryObj<typeof TeamCreateDialog> = {
  render: () => <TeamCreateDialogComponent />
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

export const LegalName = {
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
    await userEvent.type(screen.getAllByRole('textbox')[1], 'Legal Name JFP')
  }
}

export default TeamCreateDialogStory
