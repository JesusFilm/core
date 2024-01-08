import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { CopyToTeamDialog } from './CopyToTeamDialog'

const CopyToTeamDialogStory: Meta<typeof CopyToTeamDialog> = {
  ...journeysAdminConfig,
  component: CopyToTeamDialog,
  title: 'Journeys-Admin/Team/CopyToTeamDialog',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
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
          title: 'Spider Society',
          publicTitle: null,
          __typename: 'Team',
          userTeams: []
        }
      ],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        lastActiveTeamId: 'teamId'
      }
    }
  }
}

const Template: StoryObj<typeof CopyToTeamDialog> = {
  render: () => (
    <TeamProvider>
      <SnackbarProvider>
        <TeamProvider>
          <CopyToTeamDialog
            title="Copy to Another Team"
            open
            onClose={() => undefined}
            submitAction={async () => undefined}
          />
        </TeamProvider>
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
  }
}

export default CopyToTeamDialogStory
