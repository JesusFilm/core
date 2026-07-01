import {
  LazyQueryResultTuple,
  gql,
  useApolloClient,
  useLazyQuery
} from '@apollo/client'
import { formatISO } from 'date-fns'
import { useCallback } from 'react'

import {
  GetTemplateFamilyStatsAggregate,
  GetTemplateFamilyStatsAggregateVariables
} from '../../../__generated__/GetTemplateFamilyStatsAggregate'
import {
  IdType,
  PlausibleStatsAggregateFilter
} from '../../../__generated__/globalTypes'
import { earliestStatsCollected } from '../../components/Editor/Slider/JourneyFlow/AnalyticsOverlaySwitch/buildPresetDateRange'

export const GET_TEMPLATE_FAMILY_STATS_AGGREGATE = gql`
  query GetTemplateFamilyStatsAggregate(
    $id: ID!
    $idType: IdType
    $where: PlausibleStatsAggregateFilter!
  ) {
    templateFamilyStatsAggregate(id: $id, idType: $idType, where: $where) {
      childJourneysCount
      totalJourneysViews
      totalJourneysResponses
    }
  }
`

/**
 * Builds the all-time stats filter shared by every template-stats query.
 * Omitting period/date makes the Plausible Stats API silently default to
 * the last 30 days, and every call site must send the same `where` args so
 * queries and refetches read/write the same Apollo cache entry.
 */
export function buildAllTimeStatsFilter(): PlausibleStatsAggregateFilter {
  return {
    period: 'custom',
    date: `${earliestStatsCollected},${formatISO(new Date(), {
      representation: 'date'
    })}`
  }
}

/**
 * Hook that provides functions to fetch and refetch template family stats.
 *
 * @returns An object with:
 *   - query: Lazy query tuple for fetching template stats
 *   - refetchTemplateStats: Function to refetch stats for multiple templates
 */
export function useTemplateFamilyStatsAggregateLazyQuery(): {
  query: LazyQueryResultTuple<
    GetTemplateFamilyStatsAggregate,
    GetTemplateFamilyStatsAggregateVariables
  >
  refetchTemplateStats: (templateIds: string[]) => Promise<void>
} {
  const client = useApolloClient()
  const query = useLazyQuery<
    GetTemplateFamilyStatsAggregate,
    GetTemplateFamilyStatsAggregateVariables
  >(GET_TEMPLATE_FAMILY_STATS_AGGREGATE)

  /**
   * Refetches template stats for multiple template IDs.
   * Does not return anything - just triggers the refetch.
   *
   * @param templateIds - Array of template IDs to refetch stats for
   */
  const refetchTemplateStats = useCallback(
    async (templateIds: string[]): Promise<void> => {
      if (templateIds.length === 0) return

      await Promise.all(
        templateIds.map((templateId) =>
          client.query({
            query: GET_TEMPLATE_FAMILY_STATS_AGGREGATE,
            variables: {
              id: templateId,
              idType: IdType.databaseId,
              where: buildAllTimeStatsFilter()
            },
            fetchPolicy: 'network-only'
          })
        )
      )
    },
    [client]
  )

  return { query, refetchTemplateStats }
}
