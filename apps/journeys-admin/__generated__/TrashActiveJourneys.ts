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
  id: string | null;
  status: JourneyStatus | null;
}

export interface TrashActiveJourneys {
  /**
   * Sets journeys statuses to trashed
   */
  journeysTrash: (TrashActiveJourneys_journeysTrash | null)[] | null;
}

export interface TrashActiveJourneysVariables {
  ids: string[];
}
