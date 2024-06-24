import {
  NoInfer,
  QueryHookOptions,
  QueryResult,
  gql,
  useQuery
} from '@apollo/client'
import { useState } from 'react'

import { transformPlausibleBreakdown } from '../transformPlausibleBreakdown'
import { JourneyStatsBreakdown } from '../transformPlausibleBreakdown/transformPlausibleBreakdown'
import {
  GetJourneyPlausibleStatsBreakdown,
  GetJourneyPlausibleStatsBreakdownVariables
} from './__generated__/GetJourneyPlausibleStatsBreakdown'

export const GET_JOURNEY_PLAUSIBLE_STATS_BREAKDOWN = gql`
  query GetJourneyPlausibleStatsBreakdown(
    $id: ID!
    $period: String
    $date: String
    $interval: String
    $limit: Int
    $page: Int
  ) {
    journeySteps: journeysPlausibleStatsBreakdown(
      id: $id
      where: {
        property: "event:page"
        period: $period
        date: $date
        limit: $limit
        page: $page
      }
    ) {
      property
      visitors
      timeOnPage
    }
    journeyStepsActions: journeysPlausibleStatsBreakdown(
      id: $id
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
      where: {
        property: "visit:referrer"
        period: $period
        date: $date
        limit: $limit
        page: $page
      }
    ) {
      property
      visitors
    }
    journeyVisitorsPageExits: journeysPlausibleStatsBreakdown(
      id: $id
      where: {
        property: "visit:exit_page"
        period: $period
        date: $date
        limit: $limit
        page: $page
      }
    ) {
      property
      visitors
    }
    journeyActionsSums: journeysPlausibleStatsBreakdown(
      id: $id
      where: {
        property: "event:props:simpleKey"
        period: $period
        date: $date
        limit: $limit
        page: $page
      }
    ) {
      property
      events
    }
    journeyAggregateVisitors: journeysPlausibleStatsAggregate(
      id: $id
      where: { period: $period, date: $date, interval: $interval }
    ) {
      visitors {
        value
      }
    }
  }
`

export function useJourneyPlausibleStatsBreakdownQuery(
  options?: Omit<
    QueryHookOptions<
      NoInfer<GetJourneyPlausibleStatsBreakdown>,
      NoInfer<GetJourneyPlausibleStatsBreakdownVariables>
    >,
    'onCompleted'
  >
): Omit<
  QueryResult<
    GetJourneyPlausibleStatsBreakdown,
    GetJourneyPlausibleStatsBreakdownVariables
  >,
  'data'
> & { data: JourneyStatsBreakdown | undefined } {
  const [data, setData] = useState<JourneyStatsBreakdown | undefined>()
  const query = useQuery<
    GetJourneyPlausibleStatsBreakdown,
    GetJourneyPlausibleStatsBreakdownVariables
  >(GET_JOURNEY_PLAUSIBLE_STATS_BREAKDOWN, {
    ...options,
    onCompleted: (data) => {
      setData(
        transformPlausibleBreakdown({
          journeyId: options?.variables?.id,
          data
        })
      )
    }
  })
  return { ...query, data }
}
