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
  journeysDelete: DeleteTrashedJourneys_journeysDelete[];
}

export interface DeleteTrashedJourneysVariables {
  ids: string[];
}
