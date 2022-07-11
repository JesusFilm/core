/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: RestoreTrashedJourneys
// ====================================================

export interface RestoreTrashedJourneys_journeysRestore {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
}

export interface RestoreTrashedJourneys {
  /**
   * Sets journeys statuses to last active status
   */
  journeysRestore: (RestoreTrashedJourneys_journeysRestore | null)[] | null;
}

export interface RestoreTrashedJourneysVariables {
  ids: string[];
}
