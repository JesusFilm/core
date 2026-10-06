/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignVideoCarouselBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignVideoCarouselBlockUpdateText
// ====================================================

export interface CampaignVideoCarouselBlockUpdateText_campaignVideoCarouselBlockUpdate {
  __typename: "CampaignVideoCarouselBlock";
  id: string;
  eyebrow: string | null;
  title: string | null;
}

export interface CampaignVideoCarouselBlockUpdateText {
  /**
   * Update the video carousel’s default-language eyebrow or title, its Watch expansion, or its Section Background and colour overrides. Only the given fields change. The nullable `videoId` is the mode: set ⇒ the Video’s children are the cards (any label; the gateway joins them through `video`), null ⇒ the explicit CampaignVideoBlock children are.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title`): over 80 / 150 characters.
   * - BAD_USER_INPUT (field: `url`): "That link isn't a Watch video", or given together with `videoId`.
   * - BAD_USER_INPUT (field: `videoId`): not a published Watch video.
   * - BAD_USER_INPUT (field: `videoVariantLanguageId`): given without `url` or `videoId`.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock of this campaign.
   */
  campaignVideoCarouselBlockUpdate: CampaignVideoCarouselBlockUpdateText_campaignVideoCarouselBlockUpdate;
}

export interface CampaignVideoCarouselBlockUpdateTextVariables {
  id: string;
  input: CampaignVideoCarouselBlockUpdateInput;
}
