/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: LanguageFields
// ====================================================

export interface LanguageFields_name {
  __typename: "Translation";
  value: string;
  primary: boolean;
}

export interface LanguageFields {
  __typename: "Language";
  id: string;
  name: LanguageFields_name[];
}
