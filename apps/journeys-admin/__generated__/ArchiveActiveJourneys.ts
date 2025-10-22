/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: ArchiveActiveJourneys
// ====================================================

export interface ArchiveActiveJourneys_journeysArchive {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
}

export interface ArchiveActiveJourneys {
  /**
   * Sets journeys statuses to archived
   */
  journeysArchive: (ArchiveActiveJourneys_journeysArchive | null)[] | null;
}

export interface ArchiveActiveJourneysVariables {
  ids: string[];
}
