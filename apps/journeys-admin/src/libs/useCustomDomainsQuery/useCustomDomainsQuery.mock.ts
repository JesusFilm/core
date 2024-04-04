import { MockedResponse } from '@apollo/client/testing'
import { GraphQLError } from 'graphql'

import {
  CheckCustomDomain,
  CheckCustomDomain_customDomainCheck as CustomDomainCheck
} from '../../../__generated__/CheckCustomDomain'
import {
  CreateCustomDomain,
  CreateCustomDomainVariables
} from '../../../__generated__/CreateCustomDomain'
import {
  CreateJourneyCollection,
  CreateJourneyCollectionVariables
} from '../../../__generated__/CreateJourneyCollection'
import {
  DeleteCustomDomain,
  DeleteCustomDomainVariables
} from '../../../__generated__/DeleteCustomDomain'
import {
  DeleteJourneyCollection,
  DeleteJourneyCollectionVariables
} from '../../../__generated__/DeleteJourneyCollection'
import {
  GetCustomDomains,
  GetCustomDomainsVariables
} from '../../../__generated__/GetCustomDomains'
import {
  UpdateJourneyCollection,
  UpdateJourneyCollectionVariables
} from '../../../__generated__/UpdateJourneyCollection'
import {
  CREATE_JOURNEY_COLLECTION,
  DELETE_JOURNEY_COLLECTION,
  UPDATE_JOURNEY_COLLECTION
} from '../../components/Team/CustomDomainDialog/DefaultJourneyForm'
import { CHECK_CUSTOM_DOMAIN } from '../../components/Team/CustomDomainDialog/DNSConfigSection'
import {
  CREATE_CUSTOM_DOMAIN,
  DELETE_CUSTOM_DOMAIN
} from '../../components/Team/CustomDomainDialog/DomainNameForm'

import { GET_CUSTOM_DOMAINS } from './useCustomDomainsQuery'

export const getCustomDomainMockARecord: MockedResponse<
  GetCustomDomains,
  GetCustomDomainsVariables
> = {
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
          name: 'example.com',
          apexName: 'example.com',
          id: 'customDomainId',
          journeyCollection: {
            __typename: 'JourneyCollection',
            id: 'journeyCollectionId',
            journeys: []
          }
        }
      ]
    }
  }
}

export const checkCustomDomainMockConfiguredAndVerified: MockedResponse<CheckCustomDomain> =
  {
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

export const createCustomDomainMock: MockedResponse<
  CreateCustomDomain,
  CreateCustomDomainVariables
> = {
  request: {
    query: CREATE_CUSTOM_DOMAIN,
    variables: { input: { name: 'www.example.com', teamId: 'teamId' } }
  },
  result: {
    data: {
      customDomainCreate: {
        __typename: 'CustomDomain',
        id: 'customDomainId',
        apexName: 'www.example.com',
        name: 'www.example.com',
        journeyCollection: null
      }
    }
  }
}

export const deleteCustomDomainMock: MockedResponse<
  DeleteCustomDomain,
  DeleteCustomDomainVariables
> = {
  request: {
    query: DELETE_CUSTOM_DOMAIN,
    variables: { customDomainId: 'customDomainId' }
  },
  result: {
    data: {
      customDomainDelete: {
        __typename: 'CustomDomain',
        id: 'customDomainId'
      }
    }
  }
}

export const createCustomDomainErrorMock: MockedResponse<
  CheckCustomDomain,
  CreateCustomDomainVariables
> = {
  request: {
    query: CREATE_CUSTOM_DOMAIN,
    variables: { input: { name: 'www.example.com', teamId: 'teamId' } }
  },
  result: {
    errors: [new GraphQLError('Error!')]
  }
}

export const checkCustomDomainMock: (
  customDomainCheck?: Partial<CustomDomainCheck>
) => MockedResponse<CheckCustomDomain> = (customDomainCheck) => ({
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
        verificationResponse: null,
        ...customDomainCheck
      }
    }
  }
})

export const createJourneyCollectionMock: MockedResponse<
  CreateJourneyCollection,
  CreateJourneyCollectionVariables
> = {
  request: {
    query: CREATE_JOURNEY_COLLECTION,
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
  result: {
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
  }
}

export const updateJourneyCollectionMock: MockedResponse<
  UpdateJourneyCollection,
  UpdateJourneyCollectionVariables
> = {
  request: {
    query: UPDATE_JOURNEY_COLLECTION,
    variables: {
      id: 'journeyCollectionId',
      input: {
        journeyIds: ['published-journey-id']
      }
    }
  },
  result: {
    data: {
      journeyCollectionUpdate: {
        __typename: 'JourneyCollection',
        id: 'journeyCollectionId',
        journeys: [{ __typename: 'Journey', id: 'published-journey-id' }]
      }
    }
  }
}

export const deleteJourneyCollectionMock: MockedResponse<
  DeleteJourneyCollection,
  DeleteJourneyCollectionVariables
> = {
  request: {
    query: DELETE_JOURNEY_COLLECTION,
    variables: { id: 'journeyCollectionId' }
  },
  result: {
    data: {
      journeyCollectionDelete: {
        id: 'journeyCollectionId',
        customDomains: [],
        __typename: 'JourneyCollection'
      }
    }
  }
}
