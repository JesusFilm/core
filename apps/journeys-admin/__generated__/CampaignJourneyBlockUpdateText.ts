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
  /**
   * True once an author changed the snapshot title or description by hand, so "Refresh from journey" asks before replacing them. Refreshing from the journey clears it.
   */
  snapshotEdited: boolean;
}

export interface CampaignJourneyBlockUpdateText {
  /**
   * Edit a journey card’s snapshot: its default-language title and description. Only the given fields change; translations are untouched. Editing the title or description marks the snapshot edited (`snapshotEdited`, which an undo can set back outright).
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve to a live CampaignJourneyBlock.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title` / `description`): over 200 / 1000 characters.
   * - BAD_USER_INPUT (field: the field): `null` on a field that cannot be null. An omitted field is left alone; a field documented as nullable takes `null`.
   */
  campaignJourneyBlockUpdate: CampaignJourneyBlockUpdateText_campaignJourneyBlockUpdate;
}

export interface CampaignJourneyBlockUpdateTextVariables {
  id: string;
  input: CampaignJourneyBlockUpdateInput;
}
