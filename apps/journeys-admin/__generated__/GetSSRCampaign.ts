/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSSRCampaign
// ====================================================

export interface GetSSRCampaign_campaign {
  __typename: "Campaign";
  id: string;
  title: string;
}

export interface GetSSRCampaign {
  /**
   * Read a single Campaign by id. Returns both `draft` and `published` rows — use this for in-team authenticated reads. Anonymous viewers must use `campaignBySlug`, which only returns published campaigns.
   * 
   * Auth: caller must be a member of the campaign's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the campaign's team.
   */
  campaign: GetSSRCampaign_campaign;
}

export interface GetSSRCampaignVariables {
  id: string;
}
