import { Story, Meta } from '@storybook/react'
import { MockedResponse } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { CopyToTeamDialog } from './CopyToTeamDialog'

const CopyToTeamDialogStory = {
  ...journeysAdminConfig,
  component: CopyToTeamDialog,
  title: 'Journeys-Admin/Team/DuplicateToTeamDialog',
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
      teams: [{ id: 'teamId', title: 'Spider Society', __typename: 'Team' }],
      getJourneyProfile: {
        __typename: 'JourneyProfile',
        lastActiveTeamId: 'teamId'
      }
    }
  }
}

const Template: Story = () => (
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

export const Default = Template.bind({})
Default.parameters = {
  apolloClient: {
    mocks: [getTeamsMock]
  }
}

export default CopyToTeamDialogStory as Meta
