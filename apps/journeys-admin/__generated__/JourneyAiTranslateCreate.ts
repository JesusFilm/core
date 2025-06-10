/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JourneyAiTranslateCreate
// ====================================================

export interface JourneyAiTranslateCreate_journeyAiTranslateCreate_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface JourneyAiTranslateCreate_journeyAiTranslateCreate_language {
  __typename: "Language";
  id: string;
  name: JourneyAiTranslateCreate_journeyAiTranslateCreate_language_name[];
}

export interface JourneyAiTranslateCreate_journeyAiTranslateCreate {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  languageId: string;
  language: JourneyAiTranslateCreate_journeyAiTranslateCreate_language;
  createdAt: any;
  updatedAt: any;
}

export interface JourneyAiTranslateCreate {
  journeyAiTranslateCreate: JourneyAiTranslateCreate_journeyAiTranslateCreate;
}

export interface JourneyAiTranslateCreateVariables {
  journeyId: string;
  name: string;
  journeyLanguageName: string;
  textLanguageId: string;
  textLanguageName: string;
}
