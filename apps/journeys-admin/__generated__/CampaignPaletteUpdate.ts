/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignPaletteUpdate
// ====================================================

export interface CampaignPaletteUpdate_campaignUpdate {
  __typename: "Campaign";
  id: string;
  /**
   * The eight most recently used picker colours, newest first, `#RRGGBB` uppercase, no duplicates. Picker convenience; never read by the public page.
   */
  palette: string[];
}

export interface CampaignPaletteUpdate {
  /**
   * Update the campaign settings — the default-language title, the Campaign Address slug and the default language — or the Palette. Allowed on draft and published campaigns alike. The slug never follows a title change; it moves only when given here, and existing links to the old address stop resolving. The Palette is picker chrome: each entry assertHex-normalised, deduplicated, the first eight kept newest first; saved outside any Command.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title`): empty or over 100 characters.
   * - BAD_USER_INPUT (field: `slug`): fails the shape, length, reserved-word or global-uniqueness checks (including the concurrent-update race on the unique constraint).
   * - BAD_USER_INPUT (field: `palette`): an entry is not a hex colour.
   * - BAD_USER_INPUT (field: `defaultLanguageId`): not one of the campaign’s languages, including when a concurrent removal took it.
   * - BAD_USER_INPUT (field: `title`): given together with a `defaultLanguageId` that changes the default; the title is the default-language text, so change the language first, then the title.
   * - CONFLICT (field: `defaultLanguageId`, extension `count`): that many texts have no translation in the new default language yet; machine-translate or write them first. When none is missing, one transaction swaps every field’s default text with the new language’s translation; a machine value promoted to default loses its machine flag.
   * - BAD_USER_INPUT (field: the field): `null` on a field that cannot be null. An omitted field is left alone; a field documented as nullable takes `null`.
   * 
   * A slug change on a published campaign queues on-demand revalidation of its pages under the old and the new slug.
   */
  campaignUpdate: CampaignPaletteUpdate_campaignUpdate;
}

export interface CampaignPaletteUpdateVariables {
  id: string;
  input: CampaignUpdateInput;
}
