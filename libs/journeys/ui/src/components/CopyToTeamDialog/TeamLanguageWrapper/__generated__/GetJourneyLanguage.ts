/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetJourneyLanguage
// ====================================================

export interface GetJourneyLanguage_journey_language_name {
  __typename: "LanguageName";
  value: string;
  primary: boolean;
}

export interface GetJourneyLanguage_journey_language {
  __typename: "Language";
  id: string;
  bcp47: string | null;
  iso3: string | null;
  name: GetJourneyLanguage_journey_language_name[];
}

export interface GetJourneyLanguage_journey {
  __typename: "Journey";
  language: GetJourneyLanguage_journey_language;
}

export interface GetJourneyLanguage {
  journey: GetJourneyLanguage_journey;
}

export interface GetJourneyLanguageVariables {
  id: string;
}
