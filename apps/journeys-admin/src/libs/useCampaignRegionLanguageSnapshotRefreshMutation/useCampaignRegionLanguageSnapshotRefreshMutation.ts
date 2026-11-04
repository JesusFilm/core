import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignRegionLanguageSnapshotRefresh,
  CampaignRegionLanguageSnapshotRefreshVariables
} from '../../../__generated__/CampaignRegionLanguageSnapshotRefresh'
import { CAMPAIGN_REGION_LANGUAGE_FIELDS } from '../useCampaignQuery'

export const CAMPAIGN_REGION_LANGUAGE_SNAPSHOT_REFRESH = gql`
  ${CAMPAIGN_REGION_LANGUAGE_FIELDS}
  mutation CampaignRegionLanguageSnapshotRefresh($id: ID!) {
    campaignRegionLanguageSnapshotRefresh(id: $id) {
      ...CampaignRegionLanguageFields
    }
  }
`

/**
 * "Refresh from journey": re-read a Share Language's snapshot title and
 * description from its journey; the row is normalised from the result.
 * It can take seconds, so it skips the app-wide mutation queue (merged into any
 * context the caller passes) rather than hold every other save behind it.
 */
export function useCampaignRegionLanguageSnapshotRefreshMutation(
  options?: useMutation.Options<
    CampaignRegionLanguageSnapshotRefresh,
    CampaignRegionLanguageSnapshotRefreshVariables
  >
): useMutation.ResultTuple<
  CampaignRegionLanguageSnapshotRefresh,
  CampaignRegionLanguageSnapshotRefreshVariables
> {
  return useMutation<
    CampaignRegionLanguageSnapshotRefresh,
    CampaignRegionLanguageSnapshotRefreshVariables
  >(CAMPAIGN_REGION_LANGUAGE_SNAPSHOT_REFRESH, {
    ...options,
    context: { ...options?.context, skipQueue: true }
  })
}
