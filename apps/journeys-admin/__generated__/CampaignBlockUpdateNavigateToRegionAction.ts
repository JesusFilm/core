/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignNavigateToRegionActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignBlockUpdateNavigateToRegionAction
// ====================================================

export interface CampaignBlockUpdateNavigateToRegionAction_campaignBlockUpdateNavigateToRegionAction {
  __typename: "CampaignNavigateToRegionAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  /**
   * Null once the region has been deleted.
   */
  regionId: string | null;
}

export interface CampaignBlockUpdateNavigateToRegionAction {
  /**
   * Point a button at a Campaign Region’s page, carrying the visitor’s Page Language. The button’s one action becomes this navigation; any link or scroll target it had is cleared. Deleting the region later sets the target null and the button renders static.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live block.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `id`): the block is not a CampaignButtonBlock.
   * - BAD_USER_INPUT (field: `regionId`): not a region of this campaign.
   */
  campaignBlockUpdateNavigateToRegionAction: CampaignBlockUpdateNavigateToRegionAction_campaignBlockUpdateNavigateToRegionAction;
}

export interface CampaignBlockUpdateNavigateToRegionActionVariables {
  id: string;
  input: CampaignNavigateToRegionActionInput;
}
