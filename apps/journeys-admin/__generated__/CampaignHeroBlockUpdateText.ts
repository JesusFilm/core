/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignHeroBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignHeroBlockUpdateText
// ====================================================

export interface CampaignHeroBlockUpdateText_campaignHeroBlockUpdate {
  __typename: "CampaignHeroBlock";
  id: string;
  eyebrow: string | null;
  title: string | null;
  lede: string | null;
}

export interface CampaignHeroBlockUpdateText {
  /**
   * Update the hero’s default-language eyebrow, title, lede or alignment, or its Section Background and colour overrides. Only the given fields change; empty text is allowed and not rendered.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignHeroBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title` / `lede`): over 80 / 150 / 500 characters.
   * - BAD_USER_INPUT (field: `align`): not left, center or right.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock owned by this section.
   */
  campaignHeroBlockUpdate: CampaignHeroBlockUpdateText_campaignHeroBlockUpdate;
}

export interface CampaignHeroBlockUpdateTextVariables {
  id: string;
  input: CampaignHeroBlockUpdateInput;
}
