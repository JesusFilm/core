import { MockedResponse } from '@apollo/client/testing'
import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { SnackbarProvider } from 'notistack'
import { ReactElement, useState } from 'react'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { TeamUpdate } from '../../../../__generated__/TeamUpdate'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { TEAM_UPDATE } from './TeamUpdateDialog'

import { TeamUpdateDialog } from '.'

const TeamUpdateDialogStory: Meta<typeof TeamUpdateDialog> = {
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
          publicTitle: '',
          __typename: 'Team',
          userTeams: []
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

const teamUpdateMock: MockedResponse<TeamUpdate> = {
  request: {
    query: TEAM_UPDATE,
    variables: {
      id: 'teamId',
      input: {
        title: 'Jesus Film Project',
        publicTitle: ''
      }
    }
  },
  result: {
    data: {
      teamUpdate: {
        id: 'teamId',
        title: 'Jesus Film Project',
        publicTitle: '',
        __typename: 'Team'
      }
    }
  }
}

const TeamUpdateDialogComponent = (): ReactElement => {
  const [open, setOpen] = useState(true)
  return (
    <TeamProvider>
      <SnackbarProvider>
        <TeamUpdateDialog open={open} onClose={() => setOpen(false)} />
      </SnackbarProvider>
    </TeamProvider>
  )
}

const Template: StoryObj<typeof TeamUpdateDialog> = {
  render: () => <TeamUpdateDialogComponent />
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getTeamsMock, teamUpdateMock]
    }
  },
  play: async () => {
    await waitFor(
      async () =>
        await expect(screen.getAllByRole('textbox')[0]).toHaveValue('My Team')
    )
    await userEvent.clear(screen.getAllByRole('textbox')[0])
    await userEvent.type(
      screen.getAllByRole('textbox')[0],
      'Jesus Film Project'
    )
  }
}

export default TeamUpdateDialogStory
