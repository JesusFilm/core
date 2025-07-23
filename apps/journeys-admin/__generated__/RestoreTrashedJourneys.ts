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
  journeysRestore: RestoreTrashedJourneys_journeysRestore[];
}

export interface RestoreTrashedJourneysVariables {
  ids: string[];
}
