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
   * Update the video carousel’s default-language eyebrow or title. Only the given fields change; the Watch expansion and items are set by the media ticket’s mutations.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `eyebrow` / `title`): over 80 / 150 characters.
   */
  campaignVideoCarouselBlockUpdate: CampaignVideoCarouselBlockUpdateText_campaignVideoCarouselBlockUpdate;
}

export interface CampaignVideoCarouselBlockUpdateTextVariables {
  id: string;
  input: CampaignVideoCarouselBlockUpdateInput;
}
