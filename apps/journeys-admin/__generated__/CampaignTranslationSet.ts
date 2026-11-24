/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CampaignTranslationSetInput, CampaignTextSource } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: CampaignTranslationSet
// ====================================================

export interface CampaignTranslationSet_campaignTranslationSet {
  __typename: "TranslatedValue";
  /**
   * api-languages Language id.
   */
  languageId: string;
  value: string;
  source: CampaignTextSource;
}

export interface CampaignTranslationSet {
  /**
   * Write one translation of one Translated Field: `{ value, source: human }` into the target’s `<field>Translations[languageId]`, or clear that entry when `value` is empty. The default-language value is the field itself and is edited through the target’s typed update mutation. Returns the field’s translations after the write.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: the target row does not exist or is not live.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `target`): not exactly one target id.
   * - BAD_USER_INPUT (field: `field`): the target has no such translatable field.
   * - BAD_USER_INPUT (field: `languageId`): not a campaign language, or the default language.
   * - BAD_USER_INPUT (field: the text field): over the field’s cap.
   */
  campaignTranslationSet: CampaignTranslationSet_campaignTranslationSet[];
}

export interface CampaignTranslationSetVariables {
  input: CampaignTranslationSetInput;
}
