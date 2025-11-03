import {
  NoInfer,
  QueryHookOptions,
  QueryResult,
  gql,
  useQuery
} from '@apollo/client'
import { useState } from 'react'
import { Edge, Node } from 'reactflow'

import {
  GetJourneyAnalytics,
  GetJourneyAnalyticsVariables
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
      idType: databaseId
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
      idType: databaseId
      where: {
        property: "event:props:key"
        period: $period
        date: $date
        limit: $limit
        page: $page
      }
    ) {
      property
      visitors
    }
    journeyReferrer: journeysPlausibleStatsBreakdown(
      id: $id
      idType: databaseId
      where: {
        property: "visit:referrer"
        period: $period
        date: $date
        limit: $limit
        page: $page
        filters: "visit:utm_source!=ns-qr-code"
      }
    ) {
      property
      visitors
    }
    journeyUtmCampaign: journeysPlausibleStatsBreakdown(
      id: $id
      idType: databaseId
      where: {
        property: "visit:utm_campaign"
        period: $period
        date: $date
        limit: $limit
        page: $page
        filters: "visit:utm_source==ns-qr-code"
      }
    ) {
      property
      visitors
    }
    journeyVisitorsPageExits: journeysPlausibleStatsBreakdown(
      id: $id
      idType: databaseId
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
      idType: databaseId
      where: {
        property: "event:props:simpleKey"
        period: $period
        date: $date
        limit: $limit
        page: $page
      }
    ) {
      property
      visitors
    }
    journeyAggregateVisitors: journeysPlausibleStatsAggregate(
      id: $id
      idType: databaseId
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
  referrers: { nodes: Node[]; edges: Edge[] }
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
  > & { onCompleted?: (data: JourneyAnalytics | undefined) => void }
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
        const journeyAnalytics = transformJourneyAnalytics(
          options?.variables?.id,
          data
        )
        setData(journeyAnalytics)
        options?.onCompleted?.(journeyAnalytics)
      }
    }
  )
  return { ...query, data }
}
