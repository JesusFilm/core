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
   * Update the region header’s default-language intro, or its Section Background and colour overrides. Only the given fields change.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignRegionHeaderBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `intro`): over 500 characters.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock owned by this section.
   */
  campaignRegionHeaderBlockUpdate: CampaignRegionHeaderBlockUpdateText_campaignRegionHeaderBlockUpdate;
}

export interface CampaignRegionHeaderBlockUpdateTextVariables {
  id: string;
  input: CampaignRegionHeaderBlockUpdateInput;
}
