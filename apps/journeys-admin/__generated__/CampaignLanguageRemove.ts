/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignLanguageRemove
// ====================================================

export interface CampaignLanguageRemove_campaignLanguageRemove_languages_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignLanguageRemove_campaignLanguageRemove_languages_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignLanguageRemove_campaignLanguageRemove_languages_language_name[];
}

export interface CampaignLanguageRemove_campaignLanguageRemove_languages {
  __typename: "CampaignLanguage";
  id: string;
  /**
   * api-languages Language id.
   */
  languageId: string;
  order: number;
  language: CampaignLanguageRemove_campaignLanguageRemove_languages_language;
}

export interface CampaignLanguageRemove_campaignLanguageRemove {
  __typename: "Campaign";
  id: string;
  /**
   * Page Languages in selector order.
   */
  languages: CampaignLanguageRemove_campaignLanguageRemove_languages[];
}

export interface CampaignLanguageRemove {
  /**
   * Remove a Page Language from a campaign and close the gap in the selector order. `Campaign.defaultLanguageId` is always one of its languages and a campaign always has at least one, so the default and the last language cannot be removed. Stored translations in that language are kept. Not a Command.
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaign does not resolve, or the language is not one of its languages.
   * - FORBIDDEN: caller is not in the team.
   * - CONFLICT (field: `languageId`): the language is the campaign default, or its last language.
   */
  campaignLanguageRemove: CampaignLanguageRemove_campaignLanguageRemove;
}

export interface CampaignLanguageRemoveVariables {
  campaignId: string;
  languageId: string;
}
