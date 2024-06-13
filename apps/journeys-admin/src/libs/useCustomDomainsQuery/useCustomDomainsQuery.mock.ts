import { MockedResponse } from '@apollo/client/testing'

import {
  GetCustomDomains,
  GetCustomDomainsVariables
} from '../../../__generated__/GetCustomDomains'

import { GET_CUSTOM_DOMAINS } from './useCustomDomainsQuery'

export const getCustomDomainMock: MockedResponse<
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
