// import { MockedProvider } from '@apollo/client/testing'
import { MockedResponse } from '@apollo/client/testing'
import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetCustomDomains_customDomains as CustomDomain } from '../../../../../__generated__/GetCustomDomains'
import { GetLastActiveTeamIdAndTeams } from '../../../../../__generated__/GetLastActiveTeamIdAndTeams'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../../TeamProvider'

import { DomainNameForm } from '.'

const DomainNameFormStory: Meta<typeof DomainNameForm> = {
  ...journeysAdminConfig,
  component: DomainNameForm,
  title: 'Journeys-Admin/Team/CustomDomain/CustomDomainDialog/DomainNameForm'
}

const customDomain: CustomDomain = {
  __typename: 'CustomDomain',
  name: 'example.com',
  apexName: 'example.com',
  id: 'customDomainId',
  journeyCollection: null
}

const getLastActiveTeamIdAndTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> =
  {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: {
      data: {
        teams: [
          {
            id: 'teamId',
            title: 'Team Title',
            __typename: 'Team',
            userTeams: [],
            publicTitle: 'Team Title',
            customDomains: []
          }
        ],
        getJourneyProfile: {
          id: 'someId',
          __typename: 'JourneyProfile',
          lastActiveTeamId: 'teamId'
        }
      }
    }
  }

const Template: StoryObj<typeof DomainNameForm> = {
  render: (args) => (
    <TeamProvider>
      <Stack spacing={4} direction="row">
        <DomainNameForm {...args} />
      </Stack>
    </TeamProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    customDomain: null
  },
  parameters: {
    apolloClient: {
      mocks: [getLastActiveTeamIdAndTeamsMock]
    }
  }
}

export const WithCustomDomain = {
  ...Template,
  args: {
    customDomain
  },
  parameters: {
    apolloClient: {
      mocks: [getLastActiveTeamIdAndTeamsMock]
    }
  }
}

export default DomainNameFormStory
