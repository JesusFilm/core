/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignTranslationGroup } from "./globalTypes";

// ====================================================
// GraphQL query operation: StaleRows
// ====================================================

export interface StaleRows_campaignTranslations {
  __typename: "CampaignTranslation";
  group: CampaignTranslationGroup;
}

export interface StaleRows {
  /**
   * The Translations view of one campaign language: every Translated Field that has default-language text, with its text in `languageId`. Each row says who wrote it: `needsReview` is the machine’s, `edited` is a person’s, `missing` has no entry. Rows come in the view’s order (Interface, Landing page, Region page, Regions); `group` names the section.
   * 
   * Auth: campaign Read — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaign does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `languageId`): not a campaign language, or the default language, whose text is the field itself.
   */
  campaignTranslations: StaleRows_campaignTranslations[];
}
