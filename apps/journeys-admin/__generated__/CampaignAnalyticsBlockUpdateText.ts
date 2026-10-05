/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignAnalyticsBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignAnalyticsBlockUpdateText
// ====================================================

export interface CampaignAnalyticsBlockUpdateText_campaignAnalyticsBlockUpdate {
  __typename: "CampaignAnalyticsBlock";
  id: string;
  eyebrow: string | null;
  title: string | null;
}

export interface CampaignAnalyticsBlockUpdateText {
  /**
   * Update the analytics section’s default-language eyebrow or title, whether the world map shows, or its Section Background and colour overrides. Only the given fields change.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignAnalyticsBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title`): over 80 / 150 characters.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock of this campaign.
   */
  campaignAnalyticsBlockUpdate: CampaignAnalyticsBlockUpdateText_campaignAnalyticsBlockUpdate;
}

export interface CampaignAnalyticsBlockUpdateTextVariables {
  id: string;
  input: CampaignAnalyticsBlockUpdateInput;
}
