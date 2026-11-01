/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignRegionOrderUpdate
// ====================================================

export interface CampaignRegionOrderUpdate_campaignRegionOrderUpdate {
  __typename: "CampaignRegion";
  id: string;
  order: number;
}

export interface CampaignRegionOrderUpdate {
  /**
   * Move a Campaign Region to `order` among the campaign’s regions (a position past the end moves it last) and renumber them contiguously. One order serves every Region Switcher. Returns every region of the campaign with its new `order`.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `order`): negative.
   */
  campaignRegionOrderUpdate: CampaignRegionOrderUpdate_campaignRegionOrderUpdate[];
}

export interface CampaignRegionOrderUpdateVariables {
  id: string;
  order: number;
}
