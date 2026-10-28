/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignLinkActionInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignBlockUpdateLinkAction
// ====================================================

export interface CampaignBlockUpdateLinkAction_campaignBlockUpdateLinkAction {
  __typename: "CampaignLinkAction";
  /**
   * The CampaignButtonBlock this action belongs to.
   */
  parentBlockId: string;
  url: string;
  target: string | null;
}

export interface CampaignBlockUpdateLinkAction {
  /**
   * Point a button at a web address (a journey, a video or any https page). The button’s one action becomes this link; any scroll or region target it had is cleared.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live block.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `id`): the block is not a CampaignButtonBlock.
   * - BAD_USER_INPUT (field: `url`): not an https address, or over 2048 characters.
   * - BAD_USER_INPUT (field: `target`): not `_blank` or null.
   */
  campaignBlockUpdateLinkAction: CampaignBlockUpdateLinkAction_campaignBlockUpdateLinkAction;
}

export interface CampaignBlockUpdateLinkActionVariables {
  id: string;
  input: CampaignLinkActionInput;
}
