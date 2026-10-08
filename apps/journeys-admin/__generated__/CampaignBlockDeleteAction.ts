/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignBlockDeleteAction
// ====================================================

export interface CampaignBlockDeleteAction_campaignBlockDeleteAction_action_CampaignLinkAction {
  __typename: "CampaignLinkAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  url: string;
  target: string | null;
}

export interface CampaignBlockDeleteAction_campaignBlockDeleteAction_action_CampaignScrollToBlockAction {
  __typename: "CampaignScrollToBlockAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  blockId: string;
}

export interface CampaignBlockDeleteAction_campaignBlockDeleteAction_action_CampaignNavigateToRegionAction {
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

export type CampaignBlockDeleteAction_campaignBlockDeleteAction_action = CampaignBlockDeleteAction_campaignBlockDeleteAction_action_CampaignLinkAction | CampaignBlockDeleteAction_campaignBlockDeleteAction_action_CampaignScrollToBlockAction | CampaignBlockDeleteAction_campaignBlockDeleteAction_action_CampaignNavigateToRegionAction;

export interface CampaignBlockDeleteAction_campaignBlockDeleteAction {
  __typename: "CampaignButtonBlock";
  id: string;
  action: CampaignBlockDeleteAction_campaignBlockDeleteAction_action | null;
}

export interface CampaignBlockDeleteAction {
  /**
   * Remove a button’s action so it renders static. Returns the button with `action` null; a button that had no action is returned unchanged.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live block.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `id`): the block is not a CampaignButtonBlock.
   */
  campaignBlockDeleteAction: CampaignBlockDeleteAction_campaignBlockDeleteAction;
}

export interface CampaignBlockDeleteActionVariables {
  id: string;
}
