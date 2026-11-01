/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: CachedCampaignDomains
// ====================================================

export interface CachedCampaignDomains_customDomains {
  __typename: "CustomDomain";
  id: string;
  name: string;
  apexName: string;
}

export interface CachedCampaignDomains {
  __typename: "Campaign";
  id: string;
  /**
   * The Campaign Domain, as a list of at most one: the Custom Domain that belongs to this campaign. Once set it is the campaign’s only address and `/campaign/<slug>` on the root domain is NOT_FOUND. Settings reads this to show and manage the domain.
   */
  customDomains: CachedCampaignDomains_customDomains[];
}
