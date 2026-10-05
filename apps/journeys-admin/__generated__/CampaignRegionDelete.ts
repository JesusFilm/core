/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignRegionDelete
// ====================================================

export interface CampaignRegionDelete_campaignRegionDelete {
  __typename: "CampaignRegion";
  id: string;
}

export interface CampaignRegionDelete {
  /**
   * Hard-delete an unlisted Campaign Region with everything it owns: its Share Languages (each deleting its Campaign QR Code and short link), its Region Countries and its Region Lines go by cascade; `CampaignNavigateToRegionAction` rows that targeted it keep their row with `regionId` set null; linked journeys are untouched. The remaining regions are renumbered. There is no restore, so the editor confirms first. The Region Page itself is not a region and cannot be deleted. Returns the deleted row; only its scalar fields are readable.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - CONFLICT (field: `regionId`): the region is listed; unlist it first.
   */
  campaignRegionDelete: CampaignRegionDelete_campaignRegionDelete;
}

export interface CampaignRegionDeleteVariables {
  id: string;
}
