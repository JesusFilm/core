/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSSRAdminCampaign
// ====================================================

export interface GetSSRAdminCampaign_campaign {
  __typename: "Campaign";
  id: string;
}

export interface GetSSRAdminCampaign {
  /**
   * Read one Campaign by id in its full admin shape, draft or published.
   * 
   * Auth: campaign Read — any member or manager of the campaign's team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   */
  campaign: GetSSRAdminCampaign_campaign;
}

export interface GetSSRAdminCampaignVariables {
  id: string;
}
