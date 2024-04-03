import { MockedResponse } from '@apollo/client/testing'

import { CheckCustomDomain } from '../../../../__generated__/CheckCustomDomain'
import { CreateCustomDomain } from '../../../../__generated__/CreateCustomDomain'
import { DeleteCustomDomain } from '../../../../__generated__/DeleteCustomDomain'
import {
  GetCustomDomains_customDomains as CustomDomain,
  GetCustomDomains
} from '../../../../__generated__/GetCustomDomains'
import { GetLastActiveTeamIdAndTeams } from '../../../../__generated__/GetLastActiveTeamIdAndTeams'
import { JourneyCollectionCreate } from '../../../../__generated__/JourneyCollectionCreate'
import { JourneyCollectionDelete } from '../../../../__generated__/JourneyCollectionDelete'
import { UpdateJourneyCollection } from '../../../../__generated__/UpdateJourneyCollection'
import { GET_CUSTOM_DOMAINS } from '../../../libs/useCustomDomainsQuery/useCustomDomainsQuery'
import { GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS } from '../TeamProvider'

import {
  JOURNEY_COLLECTION_CREATE,
  JOURNEY_COLLECTION_DELETE,
  UPDATE_JOURNEY_COLLECTION
} from './DefaultJourneyForm/DefaultJourneyForm'
import { CREATE_CUSTOM_DOMAIN, DELETE_CUSTOM_DOMAIN } from './DomainNameForm'

export const customDomain: CustomDomain = {
  id: 'customDomainId',
  __typename: 'CustomDomain' as const,
  name: 'mockdomain.com',
  apexName: 'mockdomain.com',
  journeyCollection: null
}

export const getCustomDomainMockARecord: MockedResponse<GetCustomDomains> = {
  request: {
    query: GET_CUSTOM_DOMAINS,
    variables: {
      teamId: 'teamId'
    }
  },
  result: jest.fn(() => ({
    data: {
      customDomains: [
        {
          __typename: 'CustomDomain',
          name: 'mockdomain.com',
          apexName: 'mockdomain.com',
          id: 'customDomainId',
          teamId: 'teamId',
          verification: {
            __typename: 'CustomDomainVerification',
            verified: true,
            verification: []
          },
          configuration: {
            __typename: 'VercelDomainConfiguration',
            misconfigured: false
          },
          journeyCollection: {
            __typename: 'JourneyCollection',
            id: 'journeyCollectionId',
            journeys: []
          }
        }
      ]
    }
  }))
}

export const getCustomDomainMockEmpty: MockedResponse<GetCustomDomains> = {
  request: {
    query: GET_CUSTOM_DOMAINS,
    variables: {
      teamId: 'teamId'
    }
  },
  result: jest.fn(() => ({
    data: {
      customDomains: []
    }
  }))
}

export const getCustomDomainMockCNameAndJourneyCollection: MockedResponse<GetCustomDomains> =
  {
    request: {
      query: GET_CUSTOM_DOMAINS,
      variables: {
        teamId: 'teamId'
      }
    },
    result: jest.fn(() => ({
      data: {
        customDomains: [
          {
            __typename: 'CustomDomain',
            name: 'tandem.mockdomain.com',
            apexName: 'mockdomain.com',
            id: 'customDomainId',
            teamId: 'teamId',
            verification: {
              __typename: 'CustomDomainVerification',
              verified: true,
              verification: []
            },
            configuration: {
              __typename: 'VercelDomainConfiguration',
              misconfigured: false
            },
            journeyCollection: {
              __typename: 'JourneyCollection',
              id: 'journeyCollectionId',
              journeys: [
                {
                  __typename: 'Journey',
                  id: 'journey-id',
                  title: 'Default Journey Heading'
                }
              ]
            }
          }
        ]
      }
    }))
  }

export const mockCreateCustomDomain: MockedResponse<CreateCustomDomain> = {
  request: {
    query: CREATE_CUSTOM_DOMAIN,
    variables: { input: { name: 'www.example.com', teamId: 'teamId' } }
  },
  result: jest.fn(() => ({
    data: {
      customDomainCreate: {
        __typename: 'CustomDomain',
        id: 'customDomainId',
        apexName: 'www.example.com',
        name: 'www.example.com',
        verification: {
          __typename: 'CustomDomainVerification',
          verified: true,
          verification: []
        },
        configuration: {
          __typename: 'VercelDomainConfiguration',
          misconfigured: false
        },
        journeyCollection: null
      }
    }
  }))
}

export const mockDeleteCustomDomain: MockedResponse<DeleteCustomDomain> = {
  request: {
    query: DELETE_CUSTOM_DOMAIN,
    variables: { customDomainDeleteId: 'customDomainId' }
  },
  result: jest.fn(() => ({
    data: {
      customDomainDelete: {
        __typename: 'CustomDomain',
        id: 'customDomainId'
      }
    }
  }))
}

export const checkCustomDomainMockConfiguredAndVerified: MockedResponse<CheckCustomDomain> =
  {
    request: {
      query: GET_CUSTOM_DOMAINS,
      variables: {
        customDomainId: 'customDomainId'
      }
    },
    result: jest.fn(() => ({
      data: {
        customDomainCheck: {
          __typename: 'CustomDomainCheck',
          configured: true,
          verified: true,
          verification: null,
          verificationResponse: null
        }
      }
    }))
  }

export const getLastActiveTeamIdAndTeamsMock: MockedResponse<GetLastActiveTeamIdAndTeams> =
  {
    request: {
      query: GET_LAST_ACTIVE_TEAM_ID_AND_TEAMS
    },
    result: jest.fn(() => ({
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
    }))
  }

export const mockJourneyCollectionCreate: MockedResponse<JourneyCollectionCreate> =
  {
    request: {
      query: JOURNEY_COLLECTION_CREATE,
      variables: {
        journeyCollectionInput: {
          id: 'uuid',
          teamId: 'teamId',
          journeyIds: ['journey-id']
        },
        customDomainUpdateInput: {
          journeyCollectionId: 'uuid'
        },
        customDomainId: 'customDomainId'
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyCollectionCreate: {
          __typename: 'JourneyCollection',
          id: 'journeyCollectionId',
          journeys: [
            {
              __typename: 'Journey',
              id: 'journey-id',
              title: 'Default Journey Heading'
            }
          ]
        },
        customDomainUpdate: {
          __typename: 'CustomDomain',
          id: 'customDomainUpdate',
          journeyCollection: {
            __typename: 'JourneyCollection',
            id: 'journeyCollectionId',
            journeys: [
              {
                __typename: 'Journey',
                id: 'journey-id',
                title: 'Default Journey Heading'
              }
            ]
          }
        }
      }
    }))
  }

export const mockJourneyCollectionUpdate: MockedResponse<UpdateJourneyCollection> =
  {
    request: {
      query: UPDATE_JOURNEY_COLLECTION,
      variables: {
        id: 'journeyCollectionId',
        input: {
          journeyIds: ['published-journey-id']
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        journeyCollectionUpdate: {
          __typename: 'JourneyCollection',
          id: 'journeyCollectionId',
          journeys: [{ __typename: 'Journey', id: 'published-journey-id' }]
        }
      }
    }))
  }

export const mockJourneyCollectionDelete: MockedResponse<JourneyCollectionDelete> =
  {
    request: {
      query: JOURNEY_COLLECTION_DELETE,
      variables: { id: 'journeyCollectionId' }
    },
    result: jest.fn(() => ({
      data: {
        journeyCollectionDelete: {
          id: 'journeyCollectionId',
          customDomains: [],
          __typename: 'JourneyCollection'
        }
      }
    }))
  }
