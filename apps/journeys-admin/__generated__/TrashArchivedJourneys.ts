/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { JourneyStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: TrashArchivedJourneys
// ====================================================

export interface TrashArchivedJourneys_journeysTrash {
  __typename: "Journey";
  id: string | null;
  status: JourneyStatus | null;
}

export interface TrashArchivedJourneys {
  /**
   * Sets journeys statuses to trashed
   */
  journeysTrash: (TrashArchivedJourneys_journeysTrash | null)[] | null;
}

export interface TrashArchivedJourneysVariables {
  ids: string[];
}
