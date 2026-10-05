/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignFeaturedMediaBlockUpdateInput, CampaignMediaSide } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignFeaturedMediaBlockUpdate
// ====================================================

export interface CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate {
  __typename: "CampaignFeaturedMediaBlock";
  id: string;
  /**
   * Which side the media sits on at `md` and up.
   */
  mediaSide: CampaignMediaSide;
  /**
   * The owned CampaignVideoBlock or CampaignImageBlock in the Media Slot.
   */
  mediaBlockId: string | null;
}

export interface CampaignFeaturedMediaBlockUpdate {
  /**
   * Update a Featured Media section’s default-language eyebrow, title, lede or bullets, its media side, its Media Slot, or its Section Background and colour overrides. Only the given fields change; empty text is allowed and not rendered.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignFeaturedMediaBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title` / `lede` / `bullets`): over 80 / 150 / 500 / 1000 characters.
   * - BAD_USER_INPUT (field: `mediaSide`): not left or right.
   * - BAD_USER_INPUT (field: `mediaBlockId`): not a CampaignVideoBlock or CampaignImageBlock this section owns.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock of this campaign.
   */
  campaignFeaturedMediaBlockUpdate: CampaignFeaturedMediaBlockUpdate_campaignFeaturedMediaBlockUpdate;
}

export interface CampaignFeaturedMediaBlockUpdateVariables {
  id: string;
  input: CampaignFeaturedMediaBlockUpdateInput;
}
