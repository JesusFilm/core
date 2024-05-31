import { gql, useQuery } from '@apollo/client'
import {
  GetPlausibleStatsBreakdown,
  GetPlausibleStatsBreakdownVariables
} from '../../../__generated__/GetPlausibleStatsBreakdown'
import { STATS_BREAKDOWN_FIELDS } from '@core/journeys/ui/plausible/StatsBreakdownFields'

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
) {
  return useQuery<
    GetPlausibleStatsBreakdown,
    GetPlausibleStatsBreakdownVariables
  >(GET_PLAUSIBLE_STATS_BREAKDOWN, { variables })
}
