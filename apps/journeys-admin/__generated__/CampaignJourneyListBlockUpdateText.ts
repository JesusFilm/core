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
   * Update the journey list’s default-language eyebrow, title or lede, or its display (grid, list). Only the given fields change.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignJourneyListBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title` / `lede`): over 80 / 150 / 500 characters.
   * - BAD_USER_INPUT (field: `display`): not grid or list.
   */
  campaignJourneyListBlockUpdate: CampaignJourneyListBlockUpdateText_campaignJourneyListBlockUpdate;
}

export interface CampaignJourneyListBlockUpdateTextVariables {
  id: string;
  input: CampaignJourneyListBlockUpdateInput;
}
