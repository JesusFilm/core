import { QueryResult, gql, useQuery } from '@apollo/client'

import {
  PLAUSIBLE_JOURNEY_AGGREGATE_VISITORS_FIELDS,
  PLAUSIBLE_JOURNEY_REFERRER_FIELDS,
  PLAUSIBLE_JOURNEY_STEPS_ACTIONS_FIELDS,
  PLAUSIBLE_JOURNEY_STEPS_FIELDS,
  PLAUSIBLE_JOURNEY_VISITORS_PAGE_EXITS_FIELDS
} from '@core/journeys/ui/transformPlausibleBreakdown/plausibleFields'

import {
  GetJourneyPlausibleStatsBreakdown,
  GetJourneyPlausibleStatsBreakdownVariables
} from '../../../__generated__/GetJourneyPlausibleStatsBreakdown'

export const GET_JOURNEY_PLAUSIBLE_STATS_BREAKDOWN = gql`
  ${PLAUSIBLE_JOURNEY_AGGREGATE_VISITORS_FIELDS}
  ${PLAUSIBLE_JOURNEY_REFERRER_FIELDS}
  ${PLAUSIBLE_JOURNEY_STEPS_ACTIONS_FIELDS}
  ${PLAUSIBLE_JOURNEY_STEPS_FIELDS}
  ${PLAUSIBLE_JOURNEY_VISITORS_PAGE_EXITS_FIELDS}
  query GetJourneyPlausibleStatsBreakdown(
    $id: ID!
    $idType: IdType
    $period: String
    $date: String
    $interval: String
    $limit: Int
    $page: Int
  ) {
    journeySteps: journeysPlausibleStatsBreakdown(
      id: $id
      idType: $idType
      where: {
        property: "event:page"
        filters: "visitors"
        period: $period
        date: $date
        limit: $limit
        page: $page
      }
    ) {
      ...PlausibleJourneyStepsFields
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
      ...PlausibleJourneyStepsActionsFields
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
      ...PlausibleJourneyReferrerFields
    }
    journeyVisitorsPageExits: journeysPlausibleStatsBreakdown(
      id: $id
      idType: $idType
      where: {
        property: "visit:exit_page"
        period: $period
        date: $date
        limit: $limit
        page: $page
      }
    ) {
      ...PlausibleJourneyVisitorsPageExitsFields
    }
    journeyAggregateVisitors: journeysPlausibleStatsAggregate(
      id: $id
      idType: $idType
      where: { period: $period, date: $date, interval: $interval }
    ) {
      ...PlausibleJourneyAggregateVisitorsFields
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
