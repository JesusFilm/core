import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

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
): useQuery.Result<GetIntegration, GetIntegrationVariables> {
  const hasTeamId = variables?.teamId != null
  return useQuery<GetIntegration, GetIntegrationVariables>(GET_INTEGRATION, {
    variables: hasTeamId
      ? (variables as GetIntegrationVariables)
      : ({} as GetIntegrationVariables),
    skip: !hasTeamId
  })
}
