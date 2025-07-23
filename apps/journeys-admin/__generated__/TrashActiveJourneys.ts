/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TrashActiveJourneys
// ====================================================

export interface TrashActiveJourneys_journeysTrash {
  __typename: "Journey";
  id: string;
  status: JourneyStatus;
}

export interface TrashActiveJourneys {
  journeysTrash: TrashActiveJourneys_journeysTrash[];
}

export interface TrashActiveJourneysVariables {
  ids: string[];
}
