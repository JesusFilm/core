/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JourneyDuplicate
// ====================================================

export interface JourneyDuplicate_journeyDuplicate_language_name {
  __typename: "LanguageName";
  primary: boolean;
  value: string;
}

export interface JourneyDuplicate_journeyDuplicate_language {
  __typename: "Language";
  name: JourneyDuplicate_journeyDuplicate_language_name[];
}

export interface JourneyDuplicate_journeyDuplicate {
  __typename: "Journey";
  id: string;
  language: JourneyDuplicate_journeyDuplicate_language;
}

export interface JourneyDuplicate {
  journeyDuplicate: JourneyDuplicate_journeyDuplicate;
}

export interface JourneyDuplicateVariables {
  id: string;
  teamId: string;
}
