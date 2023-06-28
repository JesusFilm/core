import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { SnackbarProvider } from 'notistack'
import { screen, userEvent } from '@storybook/testing-library'
import { MockedResponse } from '@apollo/client/testing'
import { TeamProvider } from '../TeamProvider'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TeamCreate } from '../../../../__generated__/TeamCreate'
import { TEAM_CREATE } from './TeamCreateDialog'
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
        __typename: 'Team'
      }
    }
  }
}

const Template: Story = () => {
  const [open, setOpen] = useState(true)
  return (
    <TeamProvider>
      <SnackbarProvider>
        <TeamCreateDialog open={open} onClose={() => setOpen(false)} />
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
