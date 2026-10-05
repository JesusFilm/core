/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignFeaturedMediaBlockUpdateInput, CampaignBackgroundKind, CampaignBackgroundOverlay } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignFeaturedMediaBlockUpdateStyle
// ====================================================

export interface CampaignFeaturedMediaBlockUpdateStyle_campaignFeaturedMediaBlockUpdate {
  __typename: "CampaignFeaturedMediaBlock";
  id: string;
  backgroundKind: CampaignBackgroundKind;
  /**
   * Read only when backgroundKind is `custom`. `#RRGGBB`.
   */
  backgroundColor: string | null;
  /**
   * The owned CampaignImageBlock; read only when backgroundKind is `image`.
   */
  coverBlockId: string | null;
  /**
   * Read only when backgroundKind is `image`; null means medium.
   */
  backgroundOverlay: CampaignBackgroundOverlay | null;
  headingColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  accentColor: string | null;
}

export interface CampaignFeaturedMediaBlockUpdateStyle {
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
  campaignFeaturedMediaBlockUpdate: CampaignFeaturedMediaBlockUpdateStyle_campaignFeaturedMediaBlockUpdate;
}

export interface CampaignFeaturedMediaBlockUpdateStyleVariables {
  id: string;
  input: CampaignFeaturedMediaBlockUpdateInput;
}
