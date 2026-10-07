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
   * Update the hero’s default-language eyebrow, title, lede or alignment. Only the given fields change; empty text is allowed and not rendered.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignHeroBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title` / `lede`): over 80 / 150 / 500 characters.
   * - BAD_USER_INPUT (field: `align`): not left, center or right.
   */
  campaignHeroBlockUpdate: CampaignHeroBlockUpdateText_campaignHeroBlockUpdate;
}

export interface CampaignHeroBlockUpdateTextVariables {
  id: string;
  input: CampaignHeroBlockUpdateInput;
}
