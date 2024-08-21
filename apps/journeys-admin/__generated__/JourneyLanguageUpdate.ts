/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyUpdateInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: JourneyLanguageUpdate
// ====================================================

export interface JourneyLanguageUpdate_journeyUpdate_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface JourneyLanguageUpdate_journeyUpdate_language {
  __typename: "Language";
  id: string;
  name: JourneyLanguageUpdate_journeyUpdate_language_name[];
}

export interface JourneyLanguageUpdate_journeyUpdate {
  __typename: "Journey";
  id: string;
  language: JourneyLanguageUpdate_journeyUpdate_language;
}

export interface JourneyLanguageUpdate {
  journeyUpdate: JourneyLanguageUpdate_journeyUpdate;
}

export interface JourneyLanguageUpdateVariables {
  id: string;
  input: JourneyUpdateInput;
}
