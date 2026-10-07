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
   * Update the campaign settings: the default-language title, the Campaign Address slug and the default language. Allowed on draft and published campaigns alike. The slug never follows a title change; it moves only when given here, and existing links to the old address stop resolving.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: id does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `title`): empty or over 100 characters.
   * - BAD_USER_INPUT (field: `slug`): fails the shape, length, reserved-word or global-uniqueness checks (including the concurrent-update race on the unique constraint).
   * - BAD_USER_INPUT (field: `defaultLanguageId`): not one of the campaign’s languages.
   * - CONFLICT (field: `defaultLanguageId`, extension `count`): that many texts have no translation in the new default language yet; machine-translate or write them first. When none is missing, one transaction swaps every field’s default text with the new language’s translation; a machine value promoted to default loses its machine flag.
   */
  campaignUpdate: CampaignUpdate_campaignUpdate;
}

export interface CampaignUpdateVariables {
  id: string;
  input: CampaignUpdateInput;
}
