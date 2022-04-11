/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetLanguage
// ====================================================

export interface GetLanguage_language_name {
  __typename: "Translation";
  primary: boolean;
  value: string;
}

export interface GetLanguage_language {
  __typename: "Language";
  id: string;
  name: GetLanguage_language_name[];
}

export interface GetLanguage {
  language: GetLanguage_language | null;
}

export interface GetLanguageVariables {
  id: string;
}
