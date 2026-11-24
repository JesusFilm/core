/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignRegionCountryRemove
// ====================================================

export interface CampaignRegionCountryRemove_campaignRegionCountryRemove {
  __typename: "CampaignRegionCountry";
  id: string;
  regionId: string;
}

export interface CampaignRegionCountryRemove {
  /**
   * Remove a country chip from a Campaign Region’s card and renumber the remaining chips. Returns the deleted row.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   */
  campaignRegionCountryRemove: CampaignRegionCountryRemove_campaignRegionCountryRemove;
}

export interface CampaignRegionCountryRemoveVariables {
  id: string;
}
