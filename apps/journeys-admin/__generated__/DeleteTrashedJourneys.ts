/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: DeleteTrashedJourneys
// ====================================================

export interface DeleteTrashedJourneys_journeysDelete {
  __typename: "Journey";
  id: string | null;
  status: JourneyStatus | null;
}

export interface DeleteTrashedJourneys {
  /**
   * Sets journeys statuses to deleted
   */
  journeysDelete: (DeleteTrashedJourneys_journeysDelete | null)[] | null;
}

export interface DeleteTrashedJourneysVariables {
  ids: string[];
}
