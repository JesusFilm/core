/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: CampaignLanguageFields
// ====================================================

export interface CampaignLanguageFields_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface CampaignLanguageFields_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: CampaignLanguageFields_language_name[];
}

export interface CampaignLanguageFields {
  __typename: "CampaignLanguage";
  id: string;
  /**
   * api-languages Language id.
   */
  languageId: string;
  order: number;
  language: CampaignLanguageFields_language;
}
