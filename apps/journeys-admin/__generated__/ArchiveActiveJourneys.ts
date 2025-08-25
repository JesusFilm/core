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
  journeysArchive: ArchiveActiveJourneys_journeysArchive[];
}

export interface ArchiveActiveJourneysVariables {
  ids: string[];
}
