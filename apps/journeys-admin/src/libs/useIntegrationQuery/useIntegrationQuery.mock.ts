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
          teamId: 'team.id',
          type: IntegrationType.growthSpaces,
          accessId: 'access.id',
          accessSecretPart: 'access.secret',
          routes: [
            {
              __typename: 'GrowthSpacesRoute',
              id: 'route.id',
              name: 'route.name'
            },
            {
              __typename: 'GrowthSpacesRoute',
              id: 'route2.id',
              name: 'route2.name'
            }
          ]
        },
        {
          __typename: 'IntegrationGrowthSpaces',
          id: 'integration2.id',
          teamId: 'team.id',
          type: IntegrationType.growthSpaces,
          accessId: 'access2.id',
          accessSecretPart: 'access2.secret',
          routes: [
            {
              __typename: 'GrowthSpacesRoute',
              id: 'route.id',
              name: 'route.name'
            },
            {
              __typename: 'GrowthSpacesRoute',
              id: 'route2.id',
              name: 'route2.name'
            }
          ]
        }
      ]
    }
  }
}
