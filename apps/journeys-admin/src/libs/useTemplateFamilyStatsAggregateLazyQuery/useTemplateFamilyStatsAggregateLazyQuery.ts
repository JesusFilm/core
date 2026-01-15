import {
  LazyQueryResultTuple,
  gql,
  useApolloClient,
  useLazyQuery
} from '@apollo/client'
import { useCallback } from 'react'

import {
  GetTemplateFamilyStatsAggregate,
  GetTemplateFamilyStatsAggregateVariables
} from '../../../__generated__/GetTemplateFamilyStatsAggregate'
import { IdType } from '../../../__generated__/globalTypes'

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
              where: {}
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
