import {
  NoInfer,
  QueryHookOptions,
  QueryResult,
  gql,
  useQuery
} from '@apollo/client'
import { Edge, Node } from '@xyflow/react'
import { useState } from 'react'

import {
  GetJourneyAnalytics,
  GetJourneyAnalyticsVariables
} from './__generated__/GetJourneyAnalytics'
import { transformJourneyAnalytics } from './transformJourneyAnalytics'
import { transformReferrers } from './transformReferrers'

export const GET_JOURNEY_ANALYTICS = gql`
  query GetJourneyAnalytics($id: ID!) {
    journey(id: $id) {
      id
      journeyReferrer {
        property
        visitors
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

export interface JourneyAnalyticsReferrer {
  id: string
  stepId: string
  name: string
  visitors: number
}

export function useJourneyAnalyticsQuery(journeyId: string): {
  loading: boolean
  error?: Error
  data?: JourneyAnalytics
} {
  const { loading, error, data } = useQuery<GetJourneyAnalytics>(
    GET_JOURNEY_ANALYTICS,
    {
      variables: { id: journeyId }
    }
  )

  if (loading || error != null || data == null) {
    return { loading, error }
  }

  const referrers = data.journey?.journeyReferrer ?? []
  const { nodes, edges } = transformReferrers(
    referrers.map((referrer) => ({
      id: referrer.property,
      stepId: 'SocialPreview',
      name: referrer.property,
      visitors: referrer.visitors ?? 0
    }))
  )

  return {
    loading,
    error,
    data: {
      nodes,
      edges
    }
  }
}
