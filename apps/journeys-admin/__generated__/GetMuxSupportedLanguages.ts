/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LanguagesFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetMuxSupportedLanguages
// ====================================================

export interface GetMuxSupportedLanguages_languages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetMuxSupportedLanguages_languages {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  name: GetMuxSupportedLanguages_languages_name[];
}

export interface GetMuxSupportedLanguages {
  languages: GetMuxSupportedLanguages_languages[];
}

export interface GetMuxSupportedLanguagesVariables {
  where?: LanguagesFilter | null;
}
