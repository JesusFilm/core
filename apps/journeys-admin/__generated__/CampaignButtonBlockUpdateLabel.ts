/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignButtonBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignButtonBlockUpdateLabel
// ====================================================

export interface CampaignButtonBlockUpdateLabel_campaignButtonBlockUpdate {
  __typename: "CampaignButtonBlock";
  id: string;
  label: string;
}

export interface CampaignButtonBlockUpdateLabel {
  /**
   * Update a button’s default-language label, variant, size, alignment, colours or placement. Only the given fields change; the action and translations are untouched.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignButtonBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `label`): over 60 characters.
   * - BAD_USER_INPUT (field: `variant`, `size`, `align`, `color`, `labelColor`, `placement`): the value fails its rule.
   */
  campaignButtonBlockUpdate: CampaignButtonBlockUpdateLabel_campaignButtonBlockUpdate;
}

export interface CampaignButtonBlockUpdateLabelVariables {
  id: string;
  input: CampaignButtonBlockUpdateInput;
}
