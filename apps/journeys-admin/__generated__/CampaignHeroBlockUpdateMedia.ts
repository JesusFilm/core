/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignHeroBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignHeroBlockUpdateMedia
// ====================================================

export interface CampaignHeroBlockUpdateMedia_campaignHeroBlockUpdate {
  __typename: "CampaignHeroBlock";
  id: string;
  /**
   * The owned CampaignVideoBlock or CampaignImageBlock in the Media Slot.
   */
  mediaBlockId: string | null;
}

export interface CampaignHeroBlockUpdateMedia {
  /**
   * Update the hero’s default-language eyebrow, title, lede or alignment, its Media Slot, or its Section Background and colour overrides. Only the given fields change; empty text is allowed and not rendered.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignHeroBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title` / `lede`): over 80 / 150 / 500 characters.
   * - BAD_USER_INPUT (field: `align`): not left, center or right.
   * - BAD_USER_INPUT (field: `mediaBlockId`): not a CampaignVideoBlock or CampaignImageBlock this section owns.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock of this campaign.
   */
  campaignHeroBlockUpdate: CampaignHeroBlockUpdateMedia_campaignHeroBlockUpdate;
}

export interface CampaignHeroBlockUpdateMediaVariables {
  id: string;
  input: CampaignHeroBlockUpdateInput;
}
