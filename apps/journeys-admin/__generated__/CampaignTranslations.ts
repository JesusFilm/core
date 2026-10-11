/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignTranslationFilter, CampaignTranslationGroup, CampaignTextField, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL query operation: CampaignTranslations
// ====================================================

export interface CampaignTranslations_campaignTranslations_target {
  __typename: "CampaignTranslationTarget";
  /**
   * The block typename (`CampaignHeroBlock`, …), or `CampaignRegion`, `CampaignString` or `Campaign`.
   */
  typename: string;
  blockId: string | null;
  regionId: string | null;
  stringId: string | null;
  campaignId: string | null;
}

export interface CampaignTranslations_campaignTranslations {
  __typename: "CampaignTranslation";
  group: CampaignTranslationGroup;
  field: CampaignTextField;
  /**
   * The field’s cap on this target, in characters.
   */
  maxLength: number;
  /**
   * The text in the campaign’s default language.
   */
  defaultValue: string;
  /**
   * The text in the requested language; null when missing.
   */
  value: string | null;
  /**
   * Who wrote `value`: a person (`human`) or the machine; null when missing.
   */
  source: CampaignTextSource | null;
  target: CampaignTranslations_campaignTranslations_target;
}

export interface CampaignTranslations {
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
  campaignTranslations: CampaignTranslations_campaignTranslations[];
}

export interface CampaignTranslationsVariables {
  campaignId: string;
  languageId: string;
  filter?: CampaignTranslationFilter | null;
}
