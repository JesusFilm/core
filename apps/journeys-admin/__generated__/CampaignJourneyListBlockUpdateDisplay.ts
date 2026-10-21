/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignJourneyListBlockUpdateInput, CampaignJourneyListDisplay } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignJourneyListBlockUpdateDisplay
// ====================================================

export interface CampaignJourneyListBlockUpdateDisplay_campaignJourneyListBlockUpdate {
  __typename: "CampaignJourneyListBlock";
  id: string;
  display: CampaignJourneyListDisplay;
}

export interface CampaignJourneyListBlockUpdateDisplay {
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
   * - BAD_USER_INPUT (field: `coverBlockId`): not a CampaignImageBlock this section owns (live, or soft-deleted by an earlier swap), or the block another of its slots holds.
   */
  campaignJourneyListBlockUpdate: CampaignJourneyListBlockUpdateDisplay_campaignJourneyListBlockUpdate;
}

export interface CampaignJourneyListBlockUpdateDisplayVariables {
  id: string;
  input: CampaignJourneyListBlockUpdateInput;
}
