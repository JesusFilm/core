/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignRegionSwitcherBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignRegionSwitcherBlockUpdateText
// ====================================================

export interface CampaignRegionSwitcherBlockUpdateText_campaignRegionSwitcherBlockUpdate {
  __typename: "CampaignRegionSwitcherBlock";
  id: string;
  title: string | null;
}

export interface CampaignRegionSwitcherBlockUpdateText {
  /**
   * Update the region switcher’s default-language title or its variant (cards, list, pills). Only the given fields change.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignRegionSwitcherBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title`): over 150 characters.
   * - BAD_USER_INPUT (field: `variant`): not cards, list or pills.
   */
  campaignRegionSwitcherBlockUpdate: CampaignRegionSwitcherBlockUpdateText_campaignRegionSwitcherBlockUpdate;
}

export interface CampaignRegionSwitcherBlockUpdateTextVariables {
  id: string;
  input: CampaignRegionSwitcherBlockUpdateInput;
}
