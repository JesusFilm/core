// import { MockedProvider } from '@apollo/client/testing'
import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '@core/journeys/ui/TeamProvider'
import { GetLastActiveTeamIdAndTeams } from '@core/journeys/ui/TeamProvider/__generated__/GetLastActiveTeamIdAndTeams'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CheckCustomDomain } from '../../../../__generated__/CheckCustomDomain'
import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { GetCustomDomains } from '../../../../__generated__/GetCustomDomains'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { GET_CUSTOM_DOMAINS } from '../../../libs/useCustomDomainsQuery/useCustomDomainsQuery'
import { getCustomDomainMock } from '../../../libs/useCustomDomainsQuery/useCustomDomainsQuery.mock'
import { defaultJourney } from '../../JourneyList/journeyListData'

import { CustomDomainDialog } from './CustomDomainDialog'
import { CHECK_CUSTOM_DOMAIN } from './DNSConfigSection'

const CustomDomainDialogsStory: Meta<typeof CustomDomainDialog> = {
  ...journeysAdminConfig,
  component: CustomDomainDialog,
  title: 'Journeys-Admin/Team/CustomDomain/CustomDomainDialog'
}

const getAdminJourneysMock: MockedResponse<
  GetAdminJourneys,
  GetAdminJourneysVariables
> = {
  request: {
    query: GET_ADMIN_JOURNEYS,
    variables: {
      status: [JourneyStatus.draft, JourneyStatus.published],
      useLastActiveTeamId: true
    }
  },
  result: {
    data: {
      journeys: [defaultJourney]
    }
  }
}

const getCustomDomainMockEmpty: MockedResponse<GetCustomDomains> = {
  request: {
    query: GET_CUSTOM_DOMAINS,
    variables: {
      teamId: 'teamId'
    }
  },
  result: {
    data: {
      customDomains: []
    }
  }
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

const checkCustomDomainMock: MockedResponse<CheckCustomDomain> = {
  request: {
    query: CHECK_CUSTOM_DOMAIN,
    variables: {
      customDomainId: 'customDomainId'
    }
  },
  result: {
    data: {
      customDomainCheck: {
        __typename: 'CustomDomainCheck',
        configured: true,
        verified: true,
        verification: null,
        verificationResponse: null
      }
    }
  }
}

const Template: StoryObj<typeof CustomDomainDialog> = {
  render: () => (
    <TeamProvider>
      <CustomDomainDialog open onClose={() => noop} />
    </TeamProvider>
  )
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getCustomDomainMockEmpty]
    }
  }
}

export const Filled = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [
        getAdminJourneysMock,
        getLastActiveTeamIdAndTeamsMock,
        getCustomDomainMock,
        checkCustomDomainMock
      ]
    }
  }
}

export default CustomDomainDialogsStory
