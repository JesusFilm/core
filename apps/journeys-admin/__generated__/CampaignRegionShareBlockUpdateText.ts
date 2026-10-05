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
   * Update the region share panel’s default-language title or intro, or its Section Background and colour overrides. Only the given fields change.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignRegionShareBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title` / `intro`): over 150 / 500 characters.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock of this campaign.
   */
  campaignRegionShareBlockUpdate: CampaignRegionShareBlockUpdateText_campaignRegionShareBlockUpdate;
}

export interface CampaignRegionShareBlockUpdateTextVariables {
  id: string;
  input: CampaignRegionShareBlockUpdateInput;
}
