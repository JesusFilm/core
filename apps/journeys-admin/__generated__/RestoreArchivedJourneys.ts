/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: RestoreArchivedJourneys
// ====================================================

export interface RestoreArchivedJourneys_journeysRestore {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
}

export interface RestoreArchivedJourneys {
  /**
   * Sets journeys statuses to last active status
   */
  journeysRestore: (RestoreArchivedJourneys_journeysRestore | null)[] | null;
}

export interface RestoreArchivedJourneysVariables {
  ids: string[];
}
