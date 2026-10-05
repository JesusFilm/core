/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignRegionHeaderBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignRegionHeaderBlockUpdateText
// ====================================================

export interface CampaignRegionHeaderBlockUpdateText_campaignRegionHeaderBlockUpdate {
  __typename: "CampaignRegionHeaderBlock";
  id: string;
  intro: string | null;
}

export interface CampaignRegionHeaderBlockUpdateText {
  /**
   * Update the region header’s default-language intro.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignRegionHeaderBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `intro`): over 500 characters.
   */
  campaignRegionHeaderBlockUpdate: CampaignRegionHeaderBlockUpdateText_campaignRegionHeaderBlockUpdate;
}

export interface CampaignRegionHeaderBlockUpdateTextVariables {
  id: string;
  input: CampaignRegionHeaderBlockUpdateInput;
}
