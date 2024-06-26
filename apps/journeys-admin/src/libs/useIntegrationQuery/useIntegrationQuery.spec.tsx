import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import {
  GetIntegration_integrations as Integration,
  GetIntegration_integrations_routes as Route
} from '../../../__generated__/GetIntegration'
import { IntegrationType } from '../../../__generated__/globalTypes'
import { GET_INTEGRATION, useIntegrationQuery } from './useIntegrationQuery'

describe('useIntegrationQuery', () => {
  const route: Route = {
    __typename: 'GrowthSpacesRoute',
    id: 'route.id',
    name: 'route.name'
  }

  const integration: Integration = {
    __typename: 'IntegrationGrowthSpaces',
    id: 'integration.id',
    teamId: 'team.id',
    type: IntegrationType.growthSpaces,
    accessId: 'access.id',
    accessSecretPart: 'access.secret',
    routes: [
      route,
      {
        ...route,
        id: 'route2.id'
      }
    ]
  }
  it('should get integrations for a team', async () => {
    const mockResult = jest.fn(() => {
      return {
        data: {
          integrations: [
            integration,
            {
              ...integration,
              id: 'integration2.id',
              accessId: 'access2.id',
              accessSecretPart: 'access2.secret'
            }
          ]
        }
      }
    })

    renderHook(
      () => {
        return useIntegrationQuery({
          teamId: 'team.id'
        })
      },
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_INTEGRATION,
                  variables: {
                    teamId: 'team.id'
                  }
                },
                result: mockResult
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await act(
      async () => await waitFor(() => expect(mockResult).toHaveBeenCalled())
    )
  })
})
