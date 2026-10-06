/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignJourneyBlockUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignJourneyBlockUpdateText
// ====================================================

export interface CampaignJourneyBlockUpdateText_campaignJourneyBlockUpdate {
  __typename: "CampaignJourneyBlock";
  id: string;
  /**
   * Snapshot of the journey's title, editable; the default-language value.
   */
  title: string | null;
  /**
   * Snapshot of the journey's description, editable; the default-language value.
   */
  description: string | null;
}

export interface CampaignJourneyBlockUpdateText {
  /**
   * Edit a journey card’s snapshot: its default-language title and description. Only the given fields change; translations are untouched.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignJourneyBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title` / `description`): over 200 / 1000 characters.
   */
  campaignJourneyBlockUpdate: CampaignJourneyBlockUpdateText_campaignJourneyBlockUpdate;
}

export interface CampaignJourneyBlockUpdateTextVariables {
  id: string;
  input: CampaignJourneyBlockUpdateInput;
}
