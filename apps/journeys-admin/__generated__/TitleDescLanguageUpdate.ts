/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TitleDescLanguageUpdate
// ====================================================

export interface TitleDescLanguageUpdate_journeyUpdate_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface TitleDescLanguageUpdate_journeyUpdate_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: TitleDescLanguageUpdate_journeyUpdate_language_name[];
}

export interface TitleDescLanguageUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  /**
   * private title for creators
   */
  title: string;
  description: string | null;
  language: TitleDescLanguageUpdate_journeyUpdate_language;
  updatedAt: any;
}

export interface TitleDescLanguageUpdate {
  journeyUpdate: TitleDescLanguageUpdate_journeyUpdate;
}

export interface TitleDescLanguageUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}
