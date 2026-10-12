import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignJourneyBlockSnapshotRefresh,
  CampaignJourneyBlockSnapshotRefreshVariables
} from '../../../__generated__/CampaignJourneyBlockSnapshotRefresh'

export const CAMPAIGN_JOURNEY_BLOCK_SNAPSHOT_REFRESH = gql`
  mutation CampaignJourneyBlockSnapshotRefresh($id: ID!) {
    campaignJourneyBlockSnapshotRefresh(id: $id) {
      id
      title
      description
    }
  }
`

/** Replace a journey card's default-language title and description with the journey's own; translations are kept. */
export function useCampaignJourneyBlockSnapshotRefreshMutation(
  options?: useMutation.Options<
    CampaignJourneyBlockSnapshotRefresh,
    CampaignJourneyBlockSnapshotRefreshVariables
  >
): useMutation.ResultTuple<
  CampaignJourneyBlockSnapshotRefresh,
  CampaignJourneyBlockSnapshotRefreshVariables
> {
  return useMutation<
    CampaignJourneyBlockSnapshotRefresh,
    CampaignJourneyBlockSnapshotRefreshVariables
  >(CAMPAIGN_JOURNEY_BLOCK_SNAPSHOT_REFRESH, options)
}
