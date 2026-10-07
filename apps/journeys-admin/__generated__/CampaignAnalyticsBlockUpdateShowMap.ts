/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignAnalyticsBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignAnalyticsBlockUpdateShowMap
// ====================================================

export interface CampaignAnalyticsBlockUpdateShowMap_campaignAnalyticsBlockUpdate {
  __typename: "CampaignAnalyticsBlock";
  id: string;
  showMap: boolean;
}

export interface CampaignAnalyticsBlockUpdateShowMap {
  /**
   * Update the analytics section’s default-language eyebrow or title, or whether the world map shows. Only the given fields change.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignAnalyticsBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title`): over 80 / 150 characters.
   */
  campaignAnalyticsBlockUpdate: CampaignAnalyticsBlockUpdateShowMap_campaignAnalyticsBlockUpdate;
}

export interface CampaignAnalyticsBlockUpdateShowMapVariables {
  id: string;
  input: CampaignAnalyticsBlockUpdateInput;
}
