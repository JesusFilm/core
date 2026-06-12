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
  fromTemplateId: string | null;
}

export interface RestoreTrashedJourneys {
  journeysRestore: (RestoreTrashedJourneys_journeysRestore | null)[];
}

export interface RestoreTrashedJourneysVariables {
  ids: string[];
}
