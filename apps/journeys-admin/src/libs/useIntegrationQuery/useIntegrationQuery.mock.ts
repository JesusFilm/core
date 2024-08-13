import { MockedResponse } from '@apollo/client/testing'

import {
  GetIntegration,
  GetIntegrationVariables
} from '../../../__generated__/GetIntegration'
import { IntegrationType } from '../../../__generated__/globalTypes'

import { GET_INTEGRATION } from './useIntegrationQuery'

export const getIntegrationMock: MockedResponse<
  GetIntegration,
  GetIntegrationVariables
> = {
  request: {
    query: GET_INTEGRATION,
    variables: {
      teamId: 'team.id'
    }
  },
  result: {
    data: {
      integrations: [
        {
          __typename: 'IntegrationGrowthSpaces',
          id: 'integration.id',
          team: {
            __typename: 'Team',
            id: 'team.id'
          },
          type: IntegrationType.growthSpaces,
          accessId: 'access.id',
          accessSecretPart: 'access.secret',
          routes: [
            {
              __typename: 'IntegrationGrowthSpacesRoute',
              id: 'route.id',
              name: 'My First Email'
            },
            {
              __typename: 'IntegrationGrowthSpacesRoute',
              id: 'route2.id',
              name: 'On The Journey'
            }
          ]
        }
      ]
    }
  }
}
