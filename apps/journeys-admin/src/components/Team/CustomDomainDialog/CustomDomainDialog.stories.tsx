// import { MockedProvider } from '@apollo/client/testing'
import { MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../../__generated__/GetAdminJourneys'
import { GetCustomDomains } from '../../../../__generated__/GetCustomDomains'
import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../libs/storybook'
import { GET_ADMIN_JOURNEYS } from '../../../libs/useAdminJourneysQuery/useAdminJourneysQuery'
import { defaultJourney } from '../../JourneyList/journeyListData'
import {
  GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS,
  TeamProvider
} from '../TeamProvider'

import { CustomDomainDialog, GET_CUSTOM_DOMAINS } from './CustomDomainDialog'

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

const getCustomDomainMockVerifiedFalse: MockedResponse<GetCustomDomains> = {
  request: {
    query: GET_CUSTOM_DOMAINS,
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
          id: 'customDomainId',
          verification: {
            __typename: 'CustomDomainVerification',
            verified: false,
            verification: [
              {
                __typename: 'VercelDomainVerification',
                type: 'TXT',
                domain: '_vercel.mockdomain.com',
                value: 'vc-domain-verify=mockdomain.com,61eb769fc89e3d03578a',
                reason: ''
              }
            ]
          },
          journeyCollection: {
            __typename: 'JourneyCollection',
            id: 'journeyCollectionId',
            journeys: []
          },
          configuration: {
            __typename: 'VercelDomainConfiguration',
            misconfigured: false
          }
        }
      ]
    }
  }
}

const getCustomDomainMockARecord: MockedResponse<GetCustomDomains> = {
  request: {
    query: GET_CUSTOM_DOMAINS,
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
          id: 'customDomainId',
          verification: {
            __typename: 'CustomDomainVerification',
            verified: true,
            verification: []
          },
          journeyCollection: {
            __typename: 'JourneyCollection',
            id: 'journeyCollectionId',
            journeys: []
          },
          configuration: {
            __typename: 'VercelDomainConfiguration',
            misconfigured: false
          }
        }
      ]
    }
  }
}

const getCustomDomainMockCName: MockedResponse<GetCustomDomains> = {
  request: {
    query: GET_CUSTOM_DOMAINS,
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
          id: 'customDomainId',
          verification: {
            __typename: 'CustomDomainVerification',
            verified: true,
            verification: []
          },
          journeyCollection: {
            __typename: 'JourneyCollection',
            id: 'journeyCollectionId',
            journeys: []
          },
          configuration: {
            __typename: 'VercelDomainConfiguration',
            misconfigured: false
          }
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
      mocks: [
        getCustomDomainMockEmpty,
        getAdminJourneysMock,
        getLastActiveTeamIdAndTeamsMock
      ]
    }
  }
}

export const WithTXT = {
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

export const WithA = {
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
