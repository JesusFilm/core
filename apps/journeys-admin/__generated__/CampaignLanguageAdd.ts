/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CampaignLanguageAdd
// ====================================================

export interface CampaignLanguageAdd_campaignLanguageAdd_languages_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignLanguageAdd_campaignLanguageAdd_languages_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignLanguageAdd_campaignLanguageAdd_languages_language_name[];
}

export interface CampaignLanguageAdd_campaignLanguageAdd_languages {
  __typename: "CampaignLanguage";
  id: string;
  /**
   * api-languages Language id.
   */
  languageId: string;
  order: number;
  language: CampaignLanguageAdd_campaignLanguageAdd_languages_language;
}

export interface CampaignLanguageAdd_campaignLanguageAdd {
  __typename: "Campaign";
  id: string;
  /**
   * Page Languages in selector order.
   */
  languages: CampaignLanguageAdd_campaignLanguageAdd_languages[];
}

export interface CampaignLanguageAdd {
  /**
   * Add a Page Language to a campaign: the `CampaignLanguage` row is appended at the end of the selector order. Not a Command. The machine-translation run into the new language is a separate mutation (the Translations ticket).
   * 
   * Auth: campaign Update — any member or manager of the campaign’s team.
   * 
   * Errors:
   * - NOT_FOUND: campaign does not resolve.
   * - FORBIDDEN: caller is not in the team.
   * - BAD_USER_INPUT (field: `languageId`): not an api-languages language, or already a language of this campaign.
   */
  campaignLanguageAdd: CampaignLanguageAdd_campaignLanguageAdd;
}

export interface CampaignLanguageAddVariables {
  campaignId: string;
  languageId: string;
}
