/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignRegionShareBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignRegionShareBlockUpdateText
// ====================================================

export interface CampaignRegionShareBlockUpdateText_campaignRegionShareBlockUpdate {
  __typename: "CampaignRegionShareBlock";
  id: string;
  title: string | null;
  intro: string | null;
}

export interface CampaignRegionShareBlockUpdateText {
  /**
   * Update the region share panel’s default-language title or intro. Only the given fields change.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignRegionShareBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title` / `intro`): over 150 / 500 characters.
   */
  campaignRegionShareBlockUpdate: CampaignRegionShareBlockUpdateText_campaignRegionShareBlockUpdate;
}

export interface CampaignRegionShareBlockUpdateTextVariables {
  id: string;
  input: CampaignRegionShareBlockUpdateInput;
}
