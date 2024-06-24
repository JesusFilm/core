import {
  NoInfer,
  QueryHookOptions,
  QueryResult,
  gql,
  useQuery
} from '@apollo/client'
import { useState } from 'react'

import {
  GetJourneyAnalytics,
  GetJourneyAnalyticsVariables,
  GetJourneyAnalytics_journeyReferrer as JourneyReferrer
} from './__generated__/GetJourneyAnalytics'
import { transformJourneyAnalytics } from './transformJourneyAnalytics'

export const GET_JOURNEY_ANALYTICS = gql`
  query GetJourneyAnalytics(
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

type SumEventMap = Map<string, number>

export interface StepStat {
  stepId: string
  visitors: number
  timeOnPage: number
  visitorsExitAtStep: number
}

export interface JourneyAnalytics {
  totalVisitors: number
  chatsStarted: number
  linksVisited: number
  referrers: JourneyReferrer[]
  stepsStats: StepStat[]
  stepMap: Map<string, { eventMap: SumEventMap; total: number }>
  blockMap: SumEventMap
  targetMap: SumEventMap
}

export function useJourneyAnalyticsQuery(
  options?: Omit<
    QueryHookOptions<
      NoInfer<GetJourneyAnalytics>,
      NoInfer<GetJourneyAnalyticsVariables>
    >,
    'onCompleted'
  >
): Omit<
  QueryResult<GetJourneyAnalytics, GetJourneyAnalyticsVariables>,
  'data'
> & { data: JourneyAnalytics | undefined } {
  const [data, setData] = useState<JourneyAnalytics | undefined>()
  const query = useQuery<GetJourneyAnalytics, GetJourneyAnalyticsVariables>(
    GET_JOURNEY_ANALYTICS,
    {
      ...options,
      onCompleted: (data) => {
        setData(transformJourneyAnalytics(options?.variables?.id, data))
      }
    }
  )
  return { ...query, data }
}
