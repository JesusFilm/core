import { Story, Meta } from '@storybook/react'
import { useState } from 'react'
import { SnackbarProvider } from 'notistack'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { MockedResponse } from '@apollo/client/testing'
import { expect } from '@storybook/jest'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'
import { journeysAdminConfig } from '../../../libs/storybook'
import { TeamUpdate } from '../../../../__generated__/TeamUpdate'
import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { TEAM_UPDATE } from './TeamUpdateDialog'
import { TeamUpdateDialog } from '.'

const TeamUpdateDialogStory = {
  ...journeysAdminConfig,
  component: TeamUpdateDialog,
  title: 'Journeys-Admin/Team/TeamUpdateDialog'
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
          title: 'My Team',
          __typename: 'Team'
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        lastActiveTeamId: 'teamId'
      }
    }
  }
}

const teamUpdateMock: MockedResponse<TeamUpdate> = {
  request: {
    query: TEAM_UPDATE,
    variables: {
      id: 'teamId',
      input: {
        title: 'Jesus Film Project'
      }
    }
  },
  result: {
    data: {
      teamUpdate: {
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
        <TeamUpdateDialog open={open} onClose={() => setOpen(false)} />
      </SnackbarProvider>
    </TeamProvider>
  )
}

export const Default = Template.bind({})
Default.parameters = {
  apolloClient: {
    mocks: [getTeamsMock, teamUpdateMock]
  }
}
Default.play = async () => {
  await waitFor(() =>
    expect(screen.getByRole('textbox')).toHaveValue('My Team')
  )
  userEvent.clear(screen.getByRole('textbox'))
  userEvent.type(screen.getByRole('textbox'), 'Jesus Film Project')
}

export default TeamUpdateDialogStory as Meta
