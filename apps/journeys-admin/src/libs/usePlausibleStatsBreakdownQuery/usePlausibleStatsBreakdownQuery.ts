import { QueryResult, gql, useQuery } from '@apollo/client'

import { STATS_BREAKDOWN_FIELDS } from '@core/journeys/ui/plausible/StatsBreakdownFields'

import {
  GetPlausibleStatsBreakdown,
  GetPlausibleStatsBreakdownVariables
} from '../../../__generated__/GetPlausibleStatsBreakdown'

export const GET_PLAUSIBLE_STATS_BREAKDOWN = gql`
  ${STATS_BREAKDOWN_FIELDS}
  query GetPlausibleStatsBreakdown(
    $where: PlausibleStatsBreakdownFilter!
    $id: ID!
    $idType: IdType
  ) {
    journeysPlausibleStatsBreakdown(where: $where, id: $id, idType: $idType) {
      ...StatsBreakdownFields
    }
  }
`

export function usePlausibleStatsBreakdownQuery(
  variables: GetPlausibleStatsBreakdownVariables
): QueryResult<
  GetPlausibleStatsBreakdown,
  GetPlausibleStatsBreakdownVariables
> {
  return useQuery<
    GetPlausibleStatsBreakdown,
    GetPlausibleStatsBreakdownVariables
  >(GET_PLAUSIBLE_STATS_BREAKDOWN, { variables })
}
