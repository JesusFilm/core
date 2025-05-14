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
  id: string;
  status: JourneyStatus;
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
