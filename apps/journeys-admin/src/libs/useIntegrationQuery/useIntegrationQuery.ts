import { QueryResult, gql, useQuery } from '@apollo/client'

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
    }
  }
`

export function useIntegrationQuery(
  variables?: GetIntegrationVariables
): QueryResult<GetIntegration, GetIntegrationVariables> {
  return useQuery<GetIntegration, GetIntegrationVariables>(GET_INTEGRATION, {
    variables,
    skip: variables?.teamId == null
  })
}
