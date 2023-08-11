import { MockedResponse } from '@apollo/client/testing'
import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import { SnackbarProvider } from 'notistack'
import { useState } from 'react'

import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TEAM_CREATE } from '../../../libs/useTeamCreateMutation/useTeamCreateMutation'
import { TeamProvider } from '../TeamProvider'

import { TeamCreateDialog } from '.'

const TeamCreateDialogStory = {
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
        __typename: 'Team',
        userTeams: []
      }
    }
  }
}

const Template: Story = () => {
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

export const Default = Template.bind({})
Default.parameters = {
  apolloClient: {
    mocks: [teamCreateMock]
  }
}
Default.play = async () => {
  userEvent.type(screen.getByRole('textbox'), 'Jesus Film Project')
}

export default TeamCreateDialogStory as Meta
