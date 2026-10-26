/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetCustomDomainCampaignRoot
// ====================================================

export interface GetCustomDomainCampaignRoot_customDomains {
  __typename: "CustomDomain";
  id: string;
  /**
   * Campaign Root: the campaign served at `/` and `/<regionSlug>` on this domain; null when none, or when the campaign is a draft and the caller cannot read the domain team's campaigns.
   */
  campaignId: string | null;
}

export interface GetCustomDomainCampaignRoot {
  customDomains: GetCustomDomainCampaignRoot_customDomains[];
}

export interface GetCustomDomainCampaignRootVariables {
  teamId: string;
}
