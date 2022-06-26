/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: JourneyArchive
// ====================================================

export interface JourneyArchive_journeysArchive {
  __typename: "Journey";
  id: string;
}

export interface JourneyArchive {
  /**
   * Sets journeys statuses to archived
   */
  journeysArchive: (JourneyArchive_journeysArchive | null)[] | null;
}

export interface JourneyArchiveVariables {
  ids: string[];
}
