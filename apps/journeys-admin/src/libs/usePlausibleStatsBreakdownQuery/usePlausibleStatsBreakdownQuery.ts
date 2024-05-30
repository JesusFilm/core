import { gql, useQuery } from '@apollo/client'
import {
  GetPlausibleStatsBreakdown,
  GetPlausibleStatsBreakdownVariables
} from '../../../__generated__/GetPlausibleStatsBreakdown'

export const GET_PLAUSIBLE_STATS_BREAKDOWN = gql`
  query GetPlausibleStatsBreakdown(
    $where: PlausibleStatsBreakdownFilter!
    $id: ID!
    $idType: IdType
  ) {
    journeysPlausibleStatsBreakdown(where: $where, id: $id, idType: $idType) {
      property
      visits
      pageviews
      bounceRate
      visitDuration
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
