import { QueryResult, gql, useQuery } from '@apollo/client'
import {
  GetIntegration,
  GetIntegrationVariables
} from '../../../__generated__/GetIntegration'

export const GET_INTEGRATION = gql`
  query GetIntegration($teamId: ID!) {
    integrations(teamId: $teamId) {
      id
      teamId
      type
      ... on IntegrationGrowthSpaces {
        id
        teamId
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
    variables
  })
}
