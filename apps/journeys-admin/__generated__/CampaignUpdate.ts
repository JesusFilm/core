/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignUpdate
// ====================================================

export interface CampaignUpdate_campaignUpdate {
  __typename: "Campaign";
  id: string;
  /**
   * Default-language title; also the public page title. Required, at most 100 characters.
   */
  title: string;
  /**
   * Globally unique. The permanent Campaign Address is `/campaign/<slug>` on the root domain. Generated from the title; author-editable.
   */
  slug: string;
}

export interface CampaignUpdate {
  /**
   * Update the campaign settings — the default-language title and the Campaign Address slug — or the Palette. Allowed on draft and published campaigns alike. The slug never follows a title change; it moves only when given here, and existing links to the old address stop resolving. The Palette is picker chrome: each entry assertHex-normalised, deduplicated, the first eight kept newest first; saved outside any Command.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title`): empty or over 100 characters.
   * - BAD_USER_INPUT (field: `slug`): fails the shape, length, reserved-word or global-uniqueness checks (including the concurrent-update race on the unique constraint).
   * - BAD_USER_INPUT (field: `palette`): an entry is not a hex colour.
   */
  campaignUpdate: CampaignUpdate_campaignUpdate;
}

export interface CampaignUpdateVariables {
  id: string;
  input: CampaignUpdateInput;
}
