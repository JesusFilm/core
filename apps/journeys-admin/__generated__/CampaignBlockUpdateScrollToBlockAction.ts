/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignScrollToBlockActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignBlockUpdateScrollToBlockAction
// ====================================================

export interface CampaignBlockUpdateScrollToBlockAction_campaignBlockUpdateScrollToBlockAction {
  __typename: "CampaignScrollToBlockAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  blockId: string;
}

export interface CampaignBlockUpdateScrollToBlockAction {
  /**
   * Point a button at a section of its own page: the public page scrolls to `#<blockId>`. A header or footer button, which belongs to no page, may target a section of either page. The button’s one action becomes this scroll; any link or region target it had is cleared.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live block.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `id`): the block is not a CampaignButtonBlock.
   * - BAD_USER_INPUT (field: `blockId`): not a live top-level section of this campaign on the button’s page (an Extra, an owned block, the header, the footer and a region block are refused).
   */
  campaignBlockUpdateScrollToBlockAction: CampaignBlockUpdateScrollToBlockAction_campaignBlockUpdateScrollToBlockAction;
}

export interface CampaignBlockUpdateScrollToBlockActionVariables {
  id: string;
  input: CampaignScrollToBlockActionInput;
}
