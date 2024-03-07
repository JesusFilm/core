// import { MockedProvider } from '@apollo/client/testing'
import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { GetCustomDomain } from '../../../../__generated__/GetCustomDomain'
import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { defaultJourney } from '../../JourneyList/journeyListData'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { CustomDomainDialog, GET_CUSTOM_DOMAIN } from './CustomDomainDialog'

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

const getCustomDomainMockVerifiedFalse: MockedResponse<GetCustomDomain> = {
  request: {
    query: GET_CUSTOM_DOMAIN,
    variables: {
      teamId: 'teamId'
    }
  },
  result: {
    data: {
      customDomains: [
        {
          __typename: 'CustomDomain',
          name: 'mockdomain.com',
          apexName: 'mockdomain.com',
          defaultJourneysOnly: true,
          id: 'customDomainId',
          teamId: 'teamId',
          verified: false,
          verification: {
            __typename: 'Verification',
            type: 'TXT',
            domain: '_vercel.mockdomain.com',
            value: 'vc-domain-verify=mockdomain.com,61eb769fc89e3d03578a'
          }
        }
      ]
    }
  }
}

const getCustomDomainMockARecord: MockedResponse<GetCustomDomain> = {
  request: {
    query: GET_CUSTOM_DOMAIN,
    variables: {
      teamId: 'teamId'
    }
  },
  result: {
    data: {
      customDomains: [
        {
          __typename: 'CustomDomain',
          name: 'mockdomain.com',
          apexName: 'mockdomain.com',
          defaultJourneysOnly: true,
          id: 'customDomainId',
          teamId: 'teamId',
          verified: true,
          verification: null
        }
      ]
    }
  }
}

const getCustomDomainMockCName: MockedResponse<GetCustomDomain> = {
  request: {
    query: GET_CUSTOM_DOMAIN,
    variables: {
      teamId: 'teamId'
    }
  },
  result: {
    data: {
      customDomains: [
        {
          __typename: 'CustomDomain',
          name: 'tandem.mockdomain.com',
          apexName: 'mockdomain.com',
          defaultJourneysOnly: true,
          id: 'customDomainId',
          teamId: 'teamId',
          verified: true,
          verification: null
        }
      ]
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
            publicTitle: 'Team Title'
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
      mocks: []
    }
  }
}

export const StatusFailed = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [
        getAdminJourneysMock,
        getLastActiveTeamIdAndTeamsMock,
        getCustomDomainMockVerifiedFalse
      ]
    }
  }
}

export const WithARECORD = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [
        getAdminJourneysMock,
        getLastActiveTeamIdAndTeamsMock,
        getCustomDomainMockARecord
      ]
    }
  }
}

export const WithCNAME = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [
        getAdminJourneysMock,
        getLastActiveTeamIdAndTeamsMock,
        getCustomDomainMockCName
      ]
    }
  }
}

export default CustomDomainDialogsStory
