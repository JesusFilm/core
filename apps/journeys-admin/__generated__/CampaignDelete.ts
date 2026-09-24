/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignDelete
// ====================================================

export interface CampaignDelete_campaignDelete {
  __typename: "Campaign";
  id: string;
}

export interface CampaignDelete {
  /**
   * Hard-delete a Campaign. Cascades through `CampaignJourney` and `CampaignMedia` rows; the underlying `Journey` rows are NOT deleted. Returns the deleted campaign (last canonical view).
   * 
   * Auth: caller must be a member of the campaign's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the campaign's team.
   */
  campaignDelete: CampaignDelete_campaignDelete;
}

export interface CampaignDeleteVariables {
  id: string;
}
