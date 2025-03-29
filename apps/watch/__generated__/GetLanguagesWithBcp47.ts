/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLanguagesWithBcp47
// ====================================================

export interface GetLanguagesWithBcp47_languages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetLanguagesWithBcp47_languages {
  __typename: "Language";
  id: string;
  slug: string | null;
  bcp47: string | null;
  name: GetLanguagesWithBcp47_languages_name[];
}

export interface GetLanguagesWithBcp47 {
  languages: GetLanguagesWithBcp47_languages[];
}
