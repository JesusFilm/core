/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LanguagesFilter } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetLanguages
// ====================================================

export interface GetLanguages_languages_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetLanguages_languages {
  __typename: "Language";
  id: string;
  slug: string | null;
  name: GetLanguages_languages_name[];
}

export interface GetLanguages {
  languages: GetLanguages_languages[];
}

export interface GetLanguagesVariables {
  languageId?: string | null;
  where?: LanguagesFilter | null;
}
