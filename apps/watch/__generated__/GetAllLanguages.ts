/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAllLanguages
// ====================================================

export interface GetAllLanguages_languages_name {
  __typename: "LanguageName";
  primary: boolean;
  value: string;
}

export interface GetAllLanguages_languages {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  slug: string | null;
  name: GetAllLanguages_languages_name[];
}

export interface GetAllLanguages {
  languages: GetAllLanguages_languages[];
}
