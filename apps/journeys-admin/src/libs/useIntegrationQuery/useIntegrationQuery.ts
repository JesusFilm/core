import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'

import {
  GetIntegration,
  GetIntegrationVariables
} from '../../../__generated__/GetIntegration'

export const GET_INTEGRATION = gql`
  query GetIntegration($teamId: ID!) {
    integrations(teamId: $teamId) {
      id
      team {
        id
      }
      type
      ... on IntegrationGrowthSpaces {
        id
        accessId
        type
        accessSecretPart
        routes {
          id
          name
        }
      }
      ... on IntegrationGoogle {
        id
        type
        userId
        user {
          id
          ... on AuthenticatedUser {
            email
          }
        }
        accountEmail
      }
    }
  }
`

export function useIntegrationQuery(
  variables?: GetIntegrationVariables
): useQuery.Result<
  GetIntegration,
  GetIntegrationVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetIntegrationVariables>
> {
  return useQuery<GetIntegration, GetIntegrationVariables>(
    GET_INTEGRATION,
    // Apollo Client 4 requires `variables` for operations that declare
    // required ones, so express "no team yet" with `skipToken`.
    variables?.teamId == null ? skipToken : { variables }
  )
}
