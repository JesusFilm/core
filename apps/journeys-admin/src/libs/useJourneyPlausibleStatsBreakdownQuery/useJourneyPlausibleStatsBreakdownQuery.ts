import { QueryResult, gql, useQuery } from '@apollo/client'

import {
  GetJourneyPlausibleStatsBreakdown,
  GetJourneyPlausibleStatsBreakdownVariables
} from '../../../__generated__/GetJourneyPlausibleStatsBreakdown'

export const GET_JOURNEY_PLAUSIBLE_STATS_BREAKDOWN = gql`
  query GetJourneyPlausibleStatsBreakdown(
    $id: ID!
    $idType: IdType
    $period: String
    $date: String
    $limit: Int
    $page: Int
  ) {
    # TODO FIX: time_on_page not currently working
    # TODO FIX: bounce_rate not currently being collected properly
    journeySteps: journeysPlausibleStatsBreakdown(
      id: $id
      idType: $idType
      where: {
        property: "event:page"
        filters: "visitors,bounce_rate"
        period: $period
        date: $date
        limit: $limit
        page: $page
      }
    ) {
      property
      visitors
      bounceRate
    }
    journeyStepsActions: journeysPlausibleStatsBreakdown(
      id: $id
      idType: $idType
      where: {
        property: "event:props:key"
        period: $period
        date: $date
        limit: $limit
        page: $page
      }
    ) {
      property
      events
    }
    journeyReferrer: journeysPlausibleStatsBreakdown(
      id: $id
      idType: $idType
      where: {
        property: "visit:referrer"
        period: $period
        date: $date
        limit: $limit
        page: $page
      }
    ) {
      property
    }
  }
`

export function useJourneyPlausibleStatsBreakdownQuery(
  variables: GetJourneyPlausibleStatsBreakdownVariables
): QueryResult<
  GetJourneyPlausibleStatsBreakdown,
  GetJourneyPlausibleStatsBreakdownVariables
> {
  return useQuery<
    GetJourneyPlausibleStatsBreakdown,
    GetJourneyPlausibleStatsBreakdownVariables
  >(GET_JOURNEY_PLAUSIBLE_STATS_BREAKDOWN, { variables })
}
