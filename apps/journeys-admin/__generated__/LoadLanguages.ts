/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LoadLanguages
// ====================================================

export interface LoadLanguages_languages {
  __typename: "Language";
  id: string;
  slug: string | null;
}

export interface LoadLanguages {
  languages: LoadLanguages_languages[];
}

export interface LoadLanguagesVariables {
  subtitles: string[];
}
