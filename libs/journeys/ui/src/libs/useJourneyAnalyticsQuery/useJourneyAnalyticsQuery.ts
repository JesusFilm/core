import { ErrorLike, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { NoInfer } from '@apollo/client/utilities/internal'
import { Edge, Node } from '@xyflow/react'
import { useEffect, useState } from 'react'

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

/**
 * Apollo Client 4 removed `useQuery`'s `onCompleted` and `onError` callbacks.
 * This hook keeps offering both — `onCompleted` receiving the transformed
 * analytics rather than the raw response — by mirroring them off the query
 * result, so callers are unaffected by the upgrade.
 */
export function useJourneyAnalyticsQuery(
  options: useQuery.Options<
    NoInfer<GetJourneyAnalytics>,
    NoInfer<GetJourneyAnalyticsVariables>
  > & {
    onCompleted?: (data: JourneyAnalytics | undefined) => void
    onError?: (error: ErrorLike) => void
  }
): Omit<
  useQuery.Result<GetJourneyAnalytics, GetJourneyAnalyticsVariables>,
  'data'
> & { data: JourneyAnalytics | undefined } {
  const { onCompleted, onError, ...queryOptions } = options
  const [data, setData] = useState<JourneyAnalytics | undefined>()
  const query = useQuery<GetJourneyAnalytics, GetJourneyAnalyticsVariables>(
    GET_JOURNEY_ANALYTICS,
    queryOptions
  )
  const journeyId = options.variables?.id

  useEffect(() => {
    if (query.dataState !== 'complete') return
    const journeyAnalytics = transformJourneyAnalytics(journeyId, query.data)
    setData(journeyAnalytics)
    onCompleted?.(journeyAnalytics)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callers pass
    // inline callbacks, so depending on `onCompleted` would refire every render
  }, [query.data, query.dataState, journeyId])

  useEffect(() => {
    if (query.error != null) onError?.(query.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [query.error])

  return { ...query, data }
}
