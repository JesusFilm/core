/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignJourneyListBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignJourneyListBlockUpdateText
// ====================================================

export interface CampaignJourneyListBlockUpdateText_campaignJourneyListBlockUpdate {
  __typename: "CampaignJourneyListBlock";
  id: string;
  eyebrow: string | null;
  title: string | null;
  lede: string | null;
}

export interface CampaignJourneyListBlockUpdateText {
  /**
   * Update the journey list’s default-language eyebrow, title or lede, its display (grid, list), or its Section Background and colour overrides. Only the given fields change.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignJourneyListBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title` / `lede`): over 80 / 150 / 500 characters.
   * - BAD_USER_INPUT (field: `display`): not grid or list.
   * - BAD_USER_INPUT (field: `backgroundKind`): not none, surface, contrast, primary, custom or image.
   * - BAD_USER_INPUT (field: `backgroundOverlay`): not light, medium or heavy.
   * - BAD_USER_INPUT (field: `backgroundColor` / `headingColor` / `textColor` / `buttonColor` / `buttonTextColor` / `accentColor`): not a hex colour (empty is never a colour; null clears).
   * - BAD_USER_INPUT (field: `coverBlockId`): not a live CampaignImageBlock owned by this section.
   */
  campaignJourneyListBlockUpdate: CampaignJourneyListBlockUpdateText_campaignJourneyListBlockUpdate;
}

export interface CampaignJourneyListBlockUpdateTextVariables {
  id: string;
  input: CampaignJourneyListBlockUpdateInput;
}
